//! Check for 'NAME' without a colon
function checkNamePrefix(line, errors) {
    if (!line.startsWith("NAME:")) {
        errors.push(
            `KASTA SCENE: The line '${line}' is missing a colon after 'NAME'. It should be formatted as 'NAME:'.`
        );
        return false;
    }
    return true;
}

//! Validate the scene name
function validateSceneName(sceneName, errors, registeredSceneNames) {
    //! Check if the scene name is empty
    if (!sceneName) {
        errors.push(
            `KASTA SCENE: The line with 'NAME:' is missing a scene name. Please enter a valid scene name.`
        );
        return false;
    }

    //! Check for disallowed special characters in the scene name, allowing spaces
    if (/[^a-zA-Z0-9_ ]/.test(sceneName)) {
        errors.push(
            `KASTA SCENE: The scene name '${sceneName}' contains special characters. Only letters, numbers, underscores, and spaces are allowed.`
        );
        return false;
    }

    registeredSceneNames.add(sceneName);
    return true;
}

//! Validate Relay Type operations using regex
function validateRelayTypeOperations(names, operation, errors, sceneName) {
    const singleOnPattern = /^[a-zA-Z0-9_]+ ON$/;
    const singleOffPattern = /^[a-zA-Z0-9_]+ OFF$/;
    const groupOnPattern = /^[a-zA-Z0-9_]+(, [a-zA-Z0-9_]+)* ON$/;
    const groupOffPattern = /^[a-zA-Z0-9_]+(, [a-zA-Z0-9_]+)* OFF$/;

    const operationString = names.join(", ") + " " + operation;

    if (
        !singleOnPattern.test(operationString) &&
        !singleOffPattern.test(operationString) &&
        !groupOnPattern.test(operationString) &&
        !groupOffPattern.test(operationString)
    ) {
        errors.push(`KASTA SCENE [${sceneName}]: Invalid operation format for Relay Type. The operation string "${operationString}" is not valid. Accepted formats are:
            \n - DEVICE_NAME ON (Single ON)
            \n - DEVICE_NAME OFF (Single OFF)
            \n - DEVICE_NAME_1, DEVICE_NAME_2 ON (Group ON)
            \n - DEVICE_NAME_1, DEVICE_NAME_2 OFF (Group OFF)`);
    }
}

//! Validate Dimmer Type operations using regex
function validateDimmerTypeOperations(names, operation, errors, sceneName) {
    const singleOnPattern = /^[a-zA-Z0-9_]+ ON$/;
    const singleOffPattern = /^[a-zA-Z0-9_]+ OFF$/;
    const groupOnPattern = /^([a-zA-Z0-9_]+,\s*)+[a-zA-Z0-9_]+ ON$/;
    const groupOffPattern = /^([a-zA-Z0-9_]+,\s*)+[a-zA-Z0-9_]+ OFF$/;
    const singleDimmerPattern = /^[a-zA-Z0-9_]+ ON \+\d+%$/;
    const groupDimmerPattern = /^([a-zA-Z0-9_]+,\s*)+[a-zA-Z0-9_]+ ON \+\d+%$/;

    const operationString = names.join(", ") + " " + operation;

    if (
        !singleOnPattern.test(operationString) &&
        !singleOffPattern.test(operationString) &&
        !groupOnPattern.test(operationString) &&
        !groupOffPattern.test(operationString) &&
        !singleDimmerPattern.test(operationString) &&
        !groupDimmerPattern.test(operationString)
    ) {
        errors.push(`KASTA SCENE [${sceneName}]: Dimmer Type operation '${operationString}' does not match any of the allowed formats. Accepted formats are:
            \n - DEVICE_NAME ON (Single ON)
            \n - DEVICE_NAME OFF (Single OFF)
            \n - DEVICE_NAME_1, DEVICE_NAME_2 ON (Group ON)
            \n - DEVICE_NAME_1, DEVICE_NAME_2 OFF (Group OFF)
            \n - DEVICE_NAME ON +XX% (Single Device Dimming)
            \n - DEVICE_NAME_1, DEVICE_NAME_2 ON +XX% (Group Device Dimming)`);
    } else {
        const dimmerMatch = operation.match(/\+(\d+)%$/);
        if (dimmerMatch) {
            const dimmingValue = parseInt(dimmerMatch[1], 10);
            if (dimmingValue < 0 || dimmingValue > 100) {
                errors.push(
                    `KASTA SCENE [${sceneName}]: Dimmer Type operation '${operationString}' contains an invalid dimming value '${dimmingValue}%'. The dimming value must be between 0 and 100.`
                );
            }
        }
    }
}

//! Validate Fan Type operations using regex
function validateFanTypeOperations(parts, errors, sceneName) {
    const deviceName = parts[0];

    if (!deviceName || ["ON", "OFF", "RELAY", "SPEED"].includes(deviceName)) {
        errors.push(`KASTA SCENE [${sceneName}]: The device name is missing or invalid in the instruction: "${parts.join(' ')}". A valid device name is required.`);
        return;
    }

    if (/[^a-zA-Z0-9_]/.test(deviceName)) {
        errors.push(`KASTA SCENE [${sceneName}]: The device name '${deviceName}' contains invalid characters. Only letters, numbers, and underscores are allowed.`);
        return;
    }

    const operation = parts.slice(1).join(" ");

    const singleFanPattern = /^[a-zA-Z0-9_]+ ON RELAY (ON|OFF)(?: SPEED \d+)?$/;
    const singleFanOffPattern = /^[a-zA-Z0-9_]+ OFF RELAY OFF$/;

    const operationString = deviceName + " " + operation;

    if (
        !singleFanPattern.test(operationString) &&
        !singleFanOffPattern.test(operationString)
    ) {
        errors.push(`KASTA SCENE [${sceneName}]: Fan Type operation '${operationString}' does not match any of the allowed formats. Accepted formats are:
            \n - DEVICE_NAME ON RELAY ON (Single ON)
            \n - DEVICE_NAME OFF RELAY OFF (Single OFF)
            \n - DEVICE_NAME ON RELAY ON SPEED X (Single ON with Speed, optional)`);
    }
}

//! Validate Curtain Type operations using regex
function validateCurtainTypeOperations(names, operation, errors, sceneName) {
    const singleCurtainPattern = /^[a-zA-Z0-9_]+ (OPEN|CLOSE)$/;
    const groupCurtainPattern =
        /^[a-zA-Z0-9_]+(,\s*[a-zA-Z0-9_]+)*\s+(OPEN|CLOSE)$/;

    const operationString = names.join(", ") + " " + operation;

    if (
        !singleCurtainPattern.test(operationString) &&
        !groupCurtainPattern.test(operationString)
    ) {
        errors.push(`KASTA SCENE [${sceneName}]: Invalid operation format for Curtain Type. Accepted formats are:
            \n - DEVICE_NAME OPEN (Single Open)
            \n - DEVICE_NAME CLOSE (Single Close)
            \n - DEVICE_NAME_1, DEVICE_NAME_2 OPEN (Group Open)
            \n - DEVICE_NAME_1, DEVICE_NAME_2 CLOSE (Group Close)`);
    }
}

//! Validate PowerPoint Type operations using regex
function validatePowerPointTypeOperations(parts, errors, sceneName) {
    const singlePPTPattern = /^PPT\d+\s+(ON|OFF)$/;
    const twoWayPPTPattern = /^PPT_\d+\s+(ON|OFF)\s+(ON|OFF)$/;
    const groupPPTPattern = /^PPT_\d+(,\s*PPT_\d+)*\s+(ON|OFF)(\s+(ON|OFF))?$/;

    const operation = parts.join(" ");

    if (
        !singlePPTPattern.test(operation) &&
        !twoWayPPTPattern.test(operation) &&
        !groupPPTPattern.test(operation)
    ) {
        errors.push(`KASTA SCENE [${sceneName}]: Invalid POWERPOINT operation. Supported formats are:
            \n - PPT_1 ON ON (Two-way ON ON)
            \n - PPT_2 OFF OFF (Two-way OFF OFF)
            \n - PPT3 ON (Single-way ON)
            \n - PPT_1, PPT_2 ON OFF (Group ON OFF)`);
    }
}

//! Validate the consistency of device types within a line in a scene
function validateSceneDevicesInLine(parts, errors, deviceNameToType, sceneName) {
    let deviceTypesInLine = new Set();
    let deviceNames = [];
    let operation = null;
    let isFanOperation = false; 

    // Step 1: Check if the line contains a valid operation (ON, OFF, OPEN, CLOSE)
    if (!parts.some((part) => ["ON", "OFF", "OPEN", "CLOSE"].includes(part))) {
        const instruction = parts.join(" "); 
        errors.push(
            `KASTA SCENE [${sceneName}]: No valid operation (ON, OFF, OPEN, CLOSE) found in the instruction: "${instruction}". Unable to determine command.`
        );
        return; // Skip further processing for this line as it doesn't contain a valid operation
    }

    // Step 2: Separate device names, operation parts, and detect FAN operation
    let deviceNameProvided = false; // Flag to check if device name is provided
    parts.forEach((part) => {
        if (["ON", "OFF", "OPEN", "CLOSE"].includes(part)) {
            if (!operation) {
                operation = part; 
            }
            if (deviceNames.length === 0) {
                if (!deviceNameProvided) {
                    errors.push(
                        `KASTA SCENE [${sceneName}]: The instruction "${parts.join(' ')}" is missing a device name or has an invalid format.`
                    );
                }
                return; // Exit if no device name is provided to avoid further processing
            }
            deviceNames.push([]);  // 初始化新设备列表
        } else if (/^\+\d+%$/.test(part)) {
            operation += ` ${part}`; 
        } else if (operation) {
            if (["RELAY", "SPEED"].includes(part)) {
                isFanOperation = true;
            }
            // 检查 `deviceNames` 是否已经被初始化
            if (deviceNames.length > 0 && deviceNames[deviceNames.length - 1]) {
                deviceNames[deviceNames.length - 1].push(part.replace(",", ""));
            }
        } else {
            if (!/^\d+%$/.test(part)) {
                if (deviceNames.length === 0) {
                    deviceNames.push([]);
                }
                deviceNames[0].push(part.replace(",", ""));
                deviceNameProvided = true; // Device name is provided
            }
        }
    });

    // Additional Check: Ensure group operations are properly separated by commas, but skip for FAN operations
    if (!isFanOperation && deviceNames.flat().length > 1) {
        const instruction = parts.join(" ");
        const deviceNamesString = instruction
            .split(/(ON|OFF|OPEN|CLOSE)/)[0]
            .trim(); // 提取设备名称部分
        if (
            !deviceNamesString
                .split(",")
                .every((name) => name.trim().split(/\s+/).length === 1)
        ) {
            errors.push(
                `KASTA SCENE [${sceneName}]: Devices in a group must be properly separated by commas and spaces. The instruction "${instruction}" has incorrect separation.`
            );
            return;
        }
    }

    // Step 3: Validate the existence and type of each device
    deviceNames.forEach((names) => {
        const typesInBatch = new Set();

        names.forEach((name) => {
            const deviceType = deviceNameToType[name];
            if (deviceType) {
                typesInBatch.add(deviceType);
                deviceTypesInLine.add(deviceType);
            } else if (
                !isFanOperation &&
                !/^\+\d+%$/.test(name) && // 允许标准的 "+数字%" 格式
                !/^\d+%$/.test(name) && // 允许标准的 "数字%" 格式
                !/^\+\d+$/.test(name) && // 允许标准的 "+数字" 格式
                !/^\+\w+%$/.test(name) && // 允许 "+字母或数字%" 格式
                !/^-\d+$/.test(name) && // 允许标准的 "-数字" 格式
                !/^-\d+%$/.test(name) // 允许标准的 "-数字%" 格式
            ) {
                errors.push(
                    `KASTA SCENE [${sceneName}]: The device name '${name}' in the scene is not recognized.`
                );
            }
        });

        // Step 4: Validate mixed types in the same batch
        if (typesInBatch.size > 1) {
            const simplifiedTypesInBatch = new Set(
                [...typesInBatch].map((type) => type.split(" ")[0])
            );
            if (
                !simplifiedTypesInBatch.has("Dimmer") ||
                !simplifiedTypesInBatch.has("Relay") ||
                simplifiedTypesInBatch.size > 2
            ) {
                errors.push(
                    `KASTA SCENE [${sceneName}]: Devices in the same batch must be of the same type, except Dimmer Type and Relay Type can coexist.`
                );
            }
        }
    });

    // Step 4: If there are no recognized devices, skip further checks
    if (deviceNames.flat().length === 0) {
        return;
    }

    // Step 5: Validate operations based on device type using regex
    const checkDeviceType = (deviceType, baseType) =>
        deviceType.startsWith(baseType);
    if (
        [...deviceTypesInLine].some((type) => checkDeviceType(type, "Relay Type"))
    ) {
        validateRelayTypeOperations(
            deviceNames.flat(),
            operation,
            errors,
            sceneName
        );
    }
    if (
        [...deviceTypesInLine].some((type) => checkDeviceType(type, "Dimmer Type"))
    ) {
        validateDimmerTypeOperations(
            deviceNames.flat(),
            operation,
            errors,
            sceneName
        );
    }
    if ([...deviceTypesInLine].some((type) => checkDeviceType(type, "Fan Type"))) {
        validateFanTypeOperations(parts, errors, sceneName);
    }
    if (
        [...deviceTypesInLine].some((type) => checkDeviceType(type, "Curtain Type"))
    ) {
        validateCurtainTypeOperations(
            deviceNames.flat(),
            operation,
            errors,
            sceneName
        );
    }
    if (
        [...deviceTypesInLine].some((type) =>
            checkDeviceType(type, "PowerPoint Type")
        )
    ) {
        validatePowerPointTypeOperations(parts, errors, sceneName);
    }
}

//! Validate all scenes in the provided data
export function validateScenes(sceneDataArray, deviceNameToType) {
    const errors = [];
    const registeredSceneNames = new Set();
    let currentSceneName = null;

    sceneDataArray.forEach((line) => {
        line = line.trim();

        if (line.startsWith("CONTROL CONTENT")) {
            return;
        }

        if (line.startsWith("NAME")) {
            if (!checkNamePrefix(line, errors)) return;
            currentSceneName = line.substring(5).trim();
            if (!validateSceneName(currentSceneName, errors, registeredSceneNames))
                return;
        } else if (currentSceneName && line) {
            const parts = line.split(/\s+/);
            validateSceneDevicesInLine(
                parts,
                errors,
                deviceNameToType,
                currentSceneName
            );
        }
    });

    console.log(deviceNameToType);
    console.log("Errors found:", errors);

    return errors;
}