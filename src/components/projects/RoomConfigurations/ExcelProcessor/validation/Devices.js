import { AllDeviceTypes } from '../ExcelProcessor'; // known device types and their corresponding device modules

//! Check if the line starts with 'NAME' but is missing the colon
function checkNamePrefix(line, errors) {
    if (!line.startsWith('NAME:')) {
        errors.push(`KASTA DEVICE: The line '${line}' is missing a colon after 'NAME'. It should be formatted as 'NAME:'.`);
        return false;
    }
    return true;
}

//! Check if the device model is empty
function validateDeviceModel(deviceModel, errors) {
    if (!deviceModel) {
        errors.push(`KASTA DEVICE: The line with 'NAME:' is missing a device model. Please enter a valid device model.`);
        return false;
    }

    //! Check for disallowed special characters in the device model
    if (/[^a-zA-Z0-9_]/.test(deviceModel)) {  // Allows letters, numbers, and underscores
        errors.push(`KASTA DEVICE: The device model '${deviceModel}' contains invalid characters. Only letters, numbers, and underscores are allowed.`);
        return false;
    }

    return true;
}

//! Check if the line matches a known device model but is missing 'NAME:'
function checkMissingNamePrefix(line, errors) {
    // 检查当前行是否与 AllDeviceTypes 中的任何设备型号完全匹配
    for (const deviceType in AllDeviceTypes) {
        const models = AllDeviceTypes[deviceType];
        if (Array.isArray(models)) {
            models.forEach(model => {
                if (model === line) {
                    console.log(`Matched with model: '${model}' in deviceType: '${deviceType}'`);
                    errors.push(`KASTA DEVICE: The device model '${line}' seems to be missing the 'NAME: ' prefix. It should be formatted as 'NAME: ${line}'.`);
                    return false;
                }
            });
        } else if (typeof models === 'object') {
            for (const [subType, subModels] of Object.entries(models)) {
                subModels.forEach(subModel => {
                    if (subModel === line) {
                        console.log(`Matched with subModel: '${subModel}' in subType: '${subType}' under deviceType: '${deviceType}'`);
                        errors.push(`KASTA DEVICE: The device model '${line}' seems to be missing the 'NAME: ' prefix. It should be formatted as 'NAME: ${line}'.`);
                        return false;
                    }
                });
            }
        }
    }
    return true;
}


//! Check for duplicate device name and invalid formats
function validateDeviceName(line, errors, registeredDeviceNames) {
    if (registeredDeviceNames.has(line)) {
        errors.push(`KASTA DEVICE: The device name '${line}' is duplicated. Each device name must be unique.`);
        return false;
    }

    //! Check if the device name contains any spaces
    if (/\s/.test(line)) {
        errors.push(`KASTA DEVICE: The device name '${line}' contains spaces. Consider using underscores ('_') or camelCase instead.`);
        return false;
    }

    //! Check for disallowed special characters in the device name
    if (/[^a-zA-Z0-9_]/.test(line)) {  // Allows letters, numbers, and underscores
        errors.push(`KASTA DEVICE: The device name '${line}' contains invalid characters. Only letters, numbers, and underscores are allowed.`);
        return false;
    }

    registeredDeviceNames.add(line);
    return true;
}

export function validateDevices(deviceDataArray) {
    const errors = [];
    const deviceNameToType = {}; // store device names and their corresponding types (Dictionary)
    const registeredDeviceNames = new Set(); // track registered device names
    let currentDeviceType = null; // track the current device type
    let currentDeviceModel = null; // track the current device model

    deviceDataArray.forEach((line) => {
        line = line.trim();

        // Skip lines that start with 'QTY:' or contain '()'
        if (line.startsWith('QTY:') || line.includes('(')) {
            return;
        }

        let hasErrors = false;

        if (line.startsWith('NAME')) {
            // 验证 'NAME:' 前缀和设备型号
            if (!checkNamePrefix(line, errors)) hasErrors = true;
            currentDeviceModel = line.substring(5).trim(); // 提取 'NAME:' 之后的部分
            if (!validateDeviceModel(currentDeviceModel, errors)) hasErrors = true;
        
            // 检查设备型号是否存在于 AllDeviceTypes 中
            let modelExists = false;
            currentDeviceType = null; // 重置 currentDeviceType
        
            for (const [deviceType, models] of Object.entries(AllDeviceTypes)) {
                if (Array.isArray(models) && models.includes(currentDeviceModel)) {
                    currentDeviceType = deviceType;
                    modelExists = true;
                    break;
                } else if (typeof models === 'object') { // 处理子类型的情况
                    for (const [subType, subModels] of Object.entries(models)) {
                        if (Array.isArray(subModels) && subModels.includes(currentDeviceModel)) {
                            currentDeviceType = `${deviceType} (${subType})`; // 将子类型添加到设备类型
                            modelExists = true;
                            break;
                        }
                    }
                }
                if (modelExists) break; // 在找到匹配型号后跳出循环
            }
        
            // 如果设备型号不存在，添加错误
            if (!modelExists) {
                errors.push(`KASTA DEVICE: The device model '${currentDeviceModel}' is not recognized in any known device type.`);
                hasErrors = true;
            } else {
                // 记录设备型号与设备类型的映射
                deviceNameToType[currentDeviceModel] = currentDeviceType;
            }
        }
         else if (!hasErrors) {
            //! Check if the line matches a known device model but is missing 'NAME:'
            if (!checkMissingNamePrefix(line, errors)) hasErrors = true;

            //! Validate device name for uniqueness and format
            if (!validateDeviceName(line, errors, registeredDeviceNames)) return;

            // Record the device name with the correct type in deviceNameToType
            if (currentDeviceType) {
                deviceNameToType[line] = currentDeviceType; // Use the actual device name as the key
            }
        }
    });

    console.log('Errors found:', errors);  // Debugging line
    console.log('Device Types:', deviceNameToType);  // Debugging line to see the mapping

    return { errors, deviceNameToType, registeredDeviceNames };
}