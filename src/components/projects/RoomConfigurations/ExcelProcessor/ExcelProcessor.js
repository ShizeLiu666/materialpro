import * as XLSX from 'xlsx';

export const DevicesInSceneControl = {
    "Dimmer Type": ["KBSKTDIM", "D300IB", "D300IB2", "DH10VIB", "DM300BH", "D0-10IB", "DDAL"],
    "Relay Type": ["KBSKTREL", "S2400IB2", "RM1440BH", "KBSKTR", "Z2"],
    "Curtain Type": ["C300IBH"],
    "Fan Type": ["FC150A2"],
    "RGB Type": ["KB8RGBG", "KB36RGBS", "KB9TWG", "KB12RGBD", "KB12RGBG"],
    "PowerPoint Type": {
        "Single-Way": ["H1PPWVBX"],
        "Two-Way": ["K2PPHB", "H2PPHB", "H2PPWHB"]
    }
};

let deviceNameToType = {};

export function resetDeviceNameToType() {
    deviceNameToType = {};
}

export function extractTextFromSheet(sheet) {
    const textList = [];
    sheet.forEach(row => {
        row.forEach(cellValue => {
            if (cellValue && typeof cellValue === 'string') {
                let value = cellValue.replace('（', '(').replace('）', ')').replace('：', ':');
                value = value.replace(/\(.*?\)/g, '');
                value.split('\n').forEach(text => {
                    if (text.trim()) textList.push(text.trim());
                });
            }
        });
    });
    return textList;
}

export function processExcelToJson(fileContent) {
    const workbook = XLSX.read(fileContent, { type: 'array' });
    const allTextData = {};
    
    workbook.SheetNames.forEach(sheetName => {
        if (sheetName.includes("Programming Details")) {
            const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
            allTextData["programming details"] = extractTextFromSheet(sheet);
        }
    });

    return Object.keys(allTextData).length ? allTextData : null;
}

export function processDevices(splitData) {
    const devicesContent = splitData.devices || [];
    const devicesData = [];
    let currentShortname = null;

    function isModelMatching(model, shortname) {
        return shortname && (model.includes(shortname) || shortname.includes(model));
    }

    devicesContent.forEach(line => {
        line = line.trim();

        if (line.startsWith("NAME:")) {
            currentShortname = line.replace("NAME:", "").trim();
            return;
        }

        if (line.startsWith("QTY:")) return;

        let deviceType = null;
        const shortnameForMatching = currentShortname;  // 创建局部变量

        for (const [dtype, models] of Object.entries(DevicesInSceneControl)) {
            if (Array.isArray(models)) {
                if (models.some(model => isModelMatching(model, shortnameForMatching))) {
                    deviceType = dtype;
                    break;
                }
            } else if (typeof models === 'object') {
                for (const subType in models) {
                    if (models[subType].some(model => isModelMatching(model, shortnameForMatching))) {
                        deviceType = `${dtype} (${subType})`;
                        break;
                    }
                }
            }
            if (deviceType) break;
        }

        if (currentShortname) {
            const deviceInfo = {
                appearanceShortname: currentShortname,
                deviceName: line,
                ...(deviceType && { deviceType })
            };
            devicesData.push(deviceInfo);

            // 确保 deviceNameToType 映射
            deviceNameToType[line] = deviceType;
            console.log(`Mapping ${line} to ${deviceType}`); // 调试信息
        }
    });

    return { devices: devicesData };
}

const sceneOutputTemplates = {
    "Relay Type": (name, status) => ({
        name,
        status,
        statusConditions: {}
    }),
    "Curtain Type": (name, status) => ({
        name,
        status,
        statusConditions: {
            position: status === "OPEN" ? 100 : 0
        }
    }),
    "Dimmer Type": (name, status, level = 100) => ({
        name,
        status,
        statusConditions: {
            level
        }
    }),
    "Fan Type": (name, status, relay_status, speed) => ({
        name,
        status,
        statusConditions: {
            relay: relay_status,
            speed
        }
    }),
    "PowerPoint Type": {
        "Two-Way": (name, left_power, right_power) => ({
            name,
            statusConditions: {
                leftPowerOnOff: left_power,
                rightPowerOnOff: right_power
            }
        }),
        "Single-Way": (name, power) => ({
            name,
            statusConditions: {
                rightPowerOnOff: power
            }
        })
    }
};

function handleFanType(parts) {
    const deviceName = parts[0];
    const status = parts[1];
    const relayStatus = parts[3];
    const speed = parseInt(parts[5], 10);
    return [sceneOutputTemplates["Fan Type"](deviceName, status, relayStatus, speed)];
}

function handleDimmerType(parts) {
    const contents = [];
    const statusIndex = parts.findIndex(part => ["ON", "OFF"].includes(part));
    const status = parts[statusIndex];

    let level = 100;
    if (status === "ON" && parts.length > statusIndex + 1) {
        try {
            const levelPart = parts[statusIndex + 1].replace("+", "").replace("%", "").trim();
            level = parseInt(levelPart, 10);
        } catch (e) {
            level = 100;
        }
    } else if (status === "OFF") {
        level = 0;
    }

    parts.slice(0, statusIndex).forEach(entry => {
        const deviceName = entry.trim().replace(",", "");
        contents.push(sceneOutputTemplates["Dimmer Type"](deviceName, status, level));
    });

    return contents;
}

function handleRelayType(parts) {
    const contents = [];
    const status = parts[parts.length - 1];

    parts.slice(0, -1).forEach(entry => {
        const deviceName = entry.trim().replace(",", "");
        contents.push(sceneOutputTemplates["Relay Type"](deviceName, status));
    });

    return contents;
}

function handleCurtainType(parts) {
    const contents = [];
    const status = parts[parts.length - 1];

    parts.slice(0, -1).forEach(entry => {
        const deviceName = entry.trim().replace(",", "");
        contents.push(sceneOutputTemplates["Curtain Type"](deviceName, status));
    });

    return contents;
}

function handlePowerPointType(parts, deviceType) {
    const contents = [];

    if (deviceType.includes("Two-Way")) {
        const rightPower = parts.pop();
        const leftPower = parts.pop();
        parts.forEach(deviceName => {
            contents.push(sceneOutputTemplates["PowerPoint Type"]["Two-Way"](deviceName.trim().replace(",", ""), leftPower, rightPower));
        });
    } else if (deviceType.includes("Single-Way")) {
        const power = parts.pop();
        parts.forEach(deviceName => {
            contents.push(sceneOutputTemplates["PowerPoint Type"]["Single-Way"](deviceName.trim().replace(",", ""), power));
        });
    }

    return contents;
}

function determineDeviceType(deviceName) {
    const originalDeviceName = deviceName.trim().replace(',', '');

    // console.log("Current deviceNameToType mapping:", deviceNameToType);
    
    if (!originalDeviceName) {
        console.error(`Error: Detected empty or invalid device name: '${originalDeviceName}'`);
        throw new Error("设备名称不能为空。");
    }

    const deviceType = deviceNameToType[originalDeviceName];  // 使用映射表来查找设备类型
    if (deviceType) {
        return deviceType;
    } else {
        throw new Error(`无法确定设备类型：'${originalDeviceName}'`);
    }
}

export function parseSceneContent(sceneName, contentLines) {
    const contents = [];

    contentLines.forEach(line => {
        const parts = line.split(/\s+/);
        if (parts.length < 2) return;

        try {
            const deviceType = determineDeviceType(parts[0]);

            if (deviceType === "Fan Type") {
                contents.push(...handleFanType(parts));
            } else if (deviceType === "Relay Type") {
                contents.push(...handleRelayType(parts));
            } else if (deviceType === "Curtain Type") {
                contents.push(...handleCurtainType(parts));
            } else if (deviceType === "Dimmer Type") {
                contents.push(...handleDimmerType(parts));
            } else if (deviceType.includes("PowerPoint Type")) {
                if (deviceType.includes("Two-Way")) {
                    contents.push(...handlePowerPointType(parts, "Two-Way PowerPoint Type"));
                } else if (deviceType.includes("Single-Way")) {
                    contents.push(...handlePowerPointType(parts, "Single-Way PowerPoint Type"));
                }
            }
        } catch (e) {
            console.warn(`Skipping line due to error: ${e.message}`);
        }
    });

    return contents;
}

export function processScenes(splitData) {
    const scenesContent = splitData.scenes || [];
    const scenesData = {};
    let currentScene = null;

    scenesContent.forEach(line => {
        line = line.trim();
        
        if (line.startsWith("CONTROL CONTENT:")) return;

        if (line.startsWith("NAME:")) {
            currentScene = line.replace("NAME:", "").trim();
            if (!scenesData[currentScene]) {
                scenesData[currentScene] = [];
            }
        } else if (currentScene) {
            scenesData[currentScene].push(...parseSceneContent(currentScene, [line]));
        }
    });

    return {
        scenes: Object.entries(scenesData).map(([sceneName, contents]) => ({ sceneName, contents }))
    };
}

export function processGroups(splitData) {
    const groupsContent = splitData.groups || [];
    const groupsData = [];
    let currentGroup = null;

    groupsContent.forEach(line => {
        line = line.trim();

        if (line.startsWith("NAME:")) {
            currentGroup = line.replace("NAME:", "").trim();
            return;
        }

        if (line.startsWith("DEVICE CONTROL:")) return;

        if (currentGroup) {
            groupsData.push({
                groupName: currentGroup,
                devices: line
            });
        }
    });

    return { groups: groupsData };
}

export function processRemoteControls(splitData) {
    const remoteControlsContent = splitData.remoteControls || [];
    const remoteControlsData = [];
    let currentRemote = null;
    let currentLinks = [];

    remoteControlsContent.forEach(line => {
        line = line.trim();

        if (line.startsWith("TOTAL")) return;

        if (line.startsWith("NAME:")) {
            if (currentRemote) {
                remoteControlsData.push({ remoteName: currentRemote, links: currentLinks });
            }
            currentRemote = line.replace("NAME:", "").trim();
            currentLinks = [];
        } else if (line.startsWith("LINK:")) {
            return;
        } else {
            const parts = line.split(":");
            if (parts.length < 2) return;

            const linkIndex = parseInt(parts[0].trim(), 10) - 1;
            let linkDescription = parts[1].trim();
            let action = "NORMAL";

            if (linkDescription.includes(" - ")) {
                [linkDescription, action] = linkDescription.split(" - ");
                action = action.trim().toUpperCase();
            }

            let linkType = 0;
            let linkName = "";

            if (linkDescription.startsWith("SCENE")) {
                linkType = 2;
                linkName = linkDescription.replace("SCENE", "").trim();
            } else if (linkDescription.startsWith("GROUP")) {
                linkType = 1;
                linkName = linkDescription.replace("GROUP", "").trim();
            } else if (linkDescription.startsWith("DEVICE")) {
                linkType = 0;
                linkName = linkDescription.replace("DEVICE", "").trim();
            }

            currentLinks.push({ linkIndex, linkType, linkName, action });
        }
    });

    if (currentRemote) {
        remoteControlsData.push({ remoteName: currentRemote, links: currentLinks });
    }

    return { remoteControls: remoteControlsData };
}

export function splitJsonFile(inputData) {
    const content = inputData["programming details"] || [];
    const splitKeywords = {
        devices: "KASTA DEVICE",
        groups: "KASTA GROUP",
        scenes: "KASTA SCENE",
        remoteControls: "REMOTE CONTROL LINK"
    };

    const splitData = { devices: [], groups: [], scenes: [], remoteControls: [] };
    let currentKey = null;

    content.forEach(line => {
        if (Object.values(splitKeywords).includes(line)) {
            currentKey = Object.keys(splitKeywords).find(key => splitKeywords[key] === line);
            return;
        }
        if (currentKey) splitData[currentKey].push(line);
    });

    return {
        ...processDevices(splitData),
        ...processGroups(splitData),
        ...processScenes(splitData),
        ...processRemoteControls(splitData)
    };
}