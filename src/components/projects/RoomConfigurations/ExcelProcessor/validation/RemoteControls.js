const deviceModelToKeyCount = {
    "1 Push Panel": 1,
    "2 Push Panel": 2,
    "3 Push Panel": 3,
    "4 Push Panel": 4,
    "5 Push Panel": 5,
    "6 Push Panel": 6,
    "5 Input Module": 4,
    "6 Input Module": 4,
    "4 Output Module": 4
};

//! 检查 'NAME' 是否缺少冒号
function checkNamePrefix(line, errors) {
    if (!line.startsWith("NAME:")) {
        errors.push(
            `KASTA REMOTE CONTROL: The line '${line}' is missing a colon after 'NAME'. It should be formatted as 'NAME:'.`
        );
        return false;
    }
    return true;
}

//! 验证遥控设备的名称
function validateRemoteControlName(remoteControlName, errors, registeredRemoteControlNames) {
    //! 检查遥控设备名称是否为空
    if (!remoteControlName) {
        errors.push(
            `KASTA REMOTE CONTROL: The line with 'NAME:' is missing a device name. Please enter a valid device name.`
        );
        return false;
    }

    //! 检查遥控设备名称中是否包含不允许的特殊字符，允许空格
    if (/[^a-zA-Z0-9_ ]/.test(remoteControlName)) {
        errors.push(
            `KASTA REMOTE CONTROL: The device name '${remoteControlName}' contains special characters. Only letters, numbers, underscores, and spaces are allowed.`
        );
        return false;
    }

    registeredRemoteControlNames.add(remoteControlName);
    return true;
}

//! 获取设备的键位数
function getKeyCountFromDeviceName(deviceName, deviceNameToType) {
    const deviceType = deviceNameToType[deviceName];
    if (!deviceType) {
        return null; // 未找到设备类型
    }

    if (deviceType.includes("Remote Control")) {
        // 提取括号中的内容如 "1 Push Panel"
        const modelMatch = deviceType.match(/\((.*?)\)/);
        if (modelMatch && modelMatch[1]) {
            const model = modelMatch[1];
            return deviceModelToKeyCount[model] || null;
        }
    } else {
        // 对于 "5 Input Module"、"6 Input Module"、"4 Output Module"
        return deviceModelToKeyCount[deviceType] || null;
    }

    return null;
}

//! 检查指令行格式是否正确，并且验证 "DEVICE"、"GROUP"、"SCENE" 的存在性
function checkCommandFormat(line, errors, currentRemoteControlName, maxKeyCount) {
    const match = line.match(/^(\d+):\s*(.*)$/);
    if (!match) {
        errors.push(
            `KASTA REMOTE CONTROL: The line '${line}' in '${currentRemoteControlName}' does not follow the required format '1: COMMAND'.`
        );
        return false;
    }

    const keyNumber = parseInt(match[1], 10);
    if (isNaN(keyNumber) || keyNumber < 1 || keyNumber > maxKeyCount) {
        errors.push(
            `KASTA REMOTE CONTROL: The key number '${keyNumber}' in line '${line}' exceeds the allowed key count of ${maxKeyCount} for the device '${currentRemoteControlName}'.`
        );
        return false;
    }

    const command = match[2];
    if (!/^(DEVICE|GROUP|SCENE)\b/.test(command)) {
        errors.push(
            `KASTA REMOTE CONTROL: The command '${command}' in '${currentRemoteControlName}' must start with one of the following: 'DEVICE', 'GROUP', 'SCENE'.`
        );
        return false;
    }        

    return match;
}

//! 验证 DEVICE 指令的格式
function validateDeviceCommand(command, errors, currentRemoteControlName, registeredDeviceNames) {
    const deviceMatch = command.match(/^DEVICE\s+(\S+)(?:\s+-\s+(\S+))?$/);
    if (!deviceMatch) {
        errors.push(
            `KASTA REMOTE CONTROL: The DEVICE command '${command}' in '${currentRemoteControlName}' is not valid. Expected format: 'DEVICE <device_name>' with an optional operation after a space and '-'.`
        );
        return false;
    }

    const deviceName = deviceMatch[1];
    if (!registeredDeviceNames.has(deviceName)) {
        errors.push(
            `KASTA REMOTE CONTROL: The DEVICE name '${deviceName}' in '${currentRemoteControlName}' does not exist.`
        );
        return false;
    }

    return true;
}

//! 验证 GROUP 指令的格式
function validateGroupCommand(command, errors, currentRemoteControlName, registeredGroupNames) {
    // 先检查是否有可选操作 '-'
    let groupName, operationPart;
    
    if (command.includes(' - ')) {
        [groupName, operationPart] = command.split(/\s+-\s+/);
        groupName = groupName.replace(/^GROUP\s+/, '').trim(); // 移除 'GROUP ' 并修剪前后空格
    } else {
        groupName = command.replace(/^GROUP\s+/, '').trim(); // 没有 '-' 的情况，取到命令末尾并修剪前后空格
    }

    if (!registeredGroupNames.has(groupName)) {
        errors.push(
            `KASTA REMOTE CONTROL: The GROUP name '${groupName}' in '${currentRemoteControlName}' does not exist.`
        );
        return false;
    }

    // 如果有操作部分，可以进行进一步验证（如果需要的话）
    if (operationPart) {
        // 处理操作部分的逻辑
    }

    return true;
}

//! 验证 SCENE 指令的格式
function validateSceneCommand(command, errors, currentRemoteControlName, registeredSceneNames) {
    // 先检查是否有可选操作 '-'
    let sceneName, operationPart;
    
    if (command.includes(' - ')) {
        [sceneName, operationPart] = command.split(/\s+-\s+/);
        sceneName = sceneName.replace(/^SCENE\s+/, '').trim(); // 移除 'SCENE ' 并修剪前后空格
    } else {
        sceneName = command.replace(/^SCENE\s+/, '').trim(); // 没有 '-' 的情况，取到命令末尾并修剪前后空格
    }

    if (!registeredSceneNames.has(sceneName)) {
        errors.push(
            `KASTA REMOTE CONTROL: The SCENE name '${sceneName}' in '${currentRemoteControlName}' does not exist.`
        );
        return false;
    }

    // 如果有操作部分，可以进行进一步验证（如果需要的话）
    if (operationPart) {
        // 处理操作部分的逻辑
    }

    return true;
}

//! 验证遥控设备数据
export function validateRemoteControls(remoteControlDataArray, deviceNameToType, registeredDeviceNames, registeredGroupNames, registeredSceneNames) {
    const errors = [];
    const registeredRemoteControlNames = new Set();
    let currentRemoteControlName = null;
    let maxKeyCount = 0;

    remoteControlDataArray.forEach((line) => {
        line = line.trim();

        // 跳过 "LINK" 开头的行
        if (line.startsWith("LINK")) {
            return;
        }

        // 处理 "NAME" 开头的行
        if (line.startsWith("NAME")) {
            if (!checkNamePrefix(line, errors)) return;
            
            currentRemoteControlName = line.substring(5).trim();

            if (!validateRemoteControlName(currentRemoteControlName, errors, registeredRemoteControlNames)) {
                currentRemoteControlName = null; // 重置currentRemoteControlName
                return;
            }

            if (!deviceNameToType[currentRemoteControlName]) {
                errors.push(
                    `KASTA REMOTE CONTROL: The device name '${currentRemoteControlName}' is not recognized.`
                );
                currentRemoteControlName = null; // 重置currentRemoteControlName
                return;
            }

            const deviceType = deviceNameToType[currentRemoteControlName];

            // 检查设备类型是否为 Remote Control / 5 Input Module / 6 Input Module / 4 Output Module
            if (
                !deviceType.includes("Remote Control") &&
                deviceType !== "5 Input Module" &&
                deviceType !== "6 Input Module" &&
                deviceType !== "4 Output Module"
            ) {
                errors.push(
                    `KASTA REMOTE CONTROL: The device '${currentRemoteControlName}' is of type '${deviceType}', which is not supported. Only 'Remote Control', '5 Input Module', '6 Input Module', and '4 Output Module' types are allowed.`
                );
                currentRemoteControlName = null; // 重置currentRemoteControlName
                return;
            }

            // 获取设备的最大键位数
            maxKeyCount = getKeyCountFromDeviceName(currentRemoteControlName, deviceNameToType);

            if (maxKeyCount === null || maxKeyCount === 0) {
                errors.push(
                    `KASTA REMOTE CONTROL: Unable to determine the key count for device '${currentRemoteControlName}'.`
                );
                currentRemoteControlName = null; // 重置currentRemoteControlName
                return;
            }
        } else if (currentRemoteControlName) {
            const match = checkCommandFormat(line, errors, currentRemoteControlName, maxKeyCount);
            if (!match) return;
        
            const command = match[2];
            if (command.startsWith("DEVICE")) {
                validateDeviceCommand(command, errors, currentRemoteControlName, registeredDeviceNames);
            } else if (command.startsWith("GROUP")) {
                validateGroupCommand(command, errors, currentRemoteControlName, registeredGroupNames);
            } else if (command.startsWith("SCENE")) {
                validateSceneCommand(command, errors, currentRemoteControlName, registeredSceneNames);
            }
        }
                
    });

    console.log('================================================================')
    console.log("Errors found:", errors);

    return errors;
}
