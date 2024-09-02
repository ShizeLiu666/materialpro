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
    // Check if the line matches any known device model from AllDeviceTypes
    for (const deviceType in AllDeviceTypes) {
        const models = AllDeviceTypes[deviceType];
        if (Array.isArray(models) && models.includes(line)) {
            errors.push(`KASTA DEVICE: The device model '${line}' seems to be missing the 'NAME: ' prefix. It should be formatted as 'NAME: ${line}'.`);
            return false;
        } else if (typeof models === 'object') {
            for (const subModels of Object.values(models)) {
                if (subModels.includes(line)) {
                    errors.push(`KASTA DEVICE: The device model '${line}' seems to be missing the 'NAME: ' prefix. It should be formatted as 'NAME: ${line}'.`);
                    return false;
                }
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
            //! Validate 'NAME:' prefix and the device model
            if (!checkNamePrefix(line, errors)) hasErrors = true;
            currentDeviceModel = line.substring(5).trim(); // Extract the part after 'NAME:'
            if (!validateDeviceModel(currentDeviceModel, errors)) hasErrors = true;

            // Check if the device model exists in AllDeviceTypes
            let modelExists = false;
            currentDeviceType = null; // Reset currentDeviceType for each device

            for (const [deviceType, models] of Object.entries(AllDeviceTypes)) {
                if (Array.isArray(models) && models.includes(currentDeviceModel)) {
                    currentDeviceType = deviceType;
                    modelExists = true;
                    break;
                } else if (typeof models === 'object') { // 处理有子类型的设备
                    for (const [subType, subModels] of Object.entries(models)) {
                        if (Array.isArray(subModels) && subModels.includes(currentDeviceModel)) {
                            currentDeviceType = `${deviceType} (${subType})`; // 添加子类型到设备类型
                            modelExists = true;
                            break;
                        }
                    }
                }
                if (currentDeviceType) break;
            }

            //! If the device model doesn't exist, add an error
            if (!modelExists) {
                errors.push(`KASTA DEVICE: The device model '${currentDeviceModel}' is not recognized in any known device type.`);
                hasErrors = true;
            }

            // If we found a matching device type, record the device name with the correct type
            if (currentDeviceType && currentDeviceModel) {
                deviceNameToType[currentDeviceModel] = currentDeviceType; // Use the actual device name as the key
            } else {
                errors.push(`KASTA DEVICE: The device model '${currentDeviceModel}' is not recognized.`);
            }
        } else if (!hasErrors) {
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