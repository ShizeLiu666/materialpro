import { DevicesInSceneControl } from '../ExcelProcessor';

//! Check if the line starts with 'NAME' but is missing the colon
function checkNamePrefix(line, index, errors) {
    if (!line.startsWith('NAME:')) {
        errors.push(`Line ${index + 1} starts with 'NAME' but is missing a colon. It should be 'NAME:'.`);
        return false;
    }
    return true;
}

//! Check if the device model is empty
function validateDeviceModel(deviceModel, index, errors) {
    if (!deviceModel) {
        errors.push(`Line ${index + 1} has 'NAME:' but no device model is provided. Please enter a valid device model.`);
        return false;
    }

    //! Check for disallowed special characters in the device model
    if (/[^a-zA-Z0-9_]/.test(deviceModel)) {  // Allows letters, numbers, and underscores
        errors.push(`Device model '${deviceModel}' at line ${index + 1} contains special characters. Only letters, numbers, and underscores are allowed.`);
        return false;
    }

    return true;
}

//! Check if the line matches a known device model but is missing 'NAME:'
function checkMissingNamePrefix(line, index, errors, deviceNameToType) {
    if (deviceNameToType[line]) {
        errors.push(`Line ${index + 1} seems to be a device model '${line}' but is missing 'NAME: '. It should be formatted as 'NAME: ${line}'.`);
        return false;
    }
    return true;
}

//! Check for duplicate device name and invalid formats
function validateDeviceName(line, index, errors, registeredDeviceNames) {
    if (registeredDeviceNames.has(line)) {
        errors.push(`Duplicate device name '${line}' found at line ${index + 1}. Each device name must be unique.`);
        return false;
    }

    //! Check if the device name contains any spaces
    if (/\s/.test(line)) {
        errors.push(`Device name '${line}' at line ${index + 1} contains spaces. Consider using underscores ('_') or camelCase instead.`);
        return false;
    }

    //! Check for disallowed special characters in the device name
    if (/[^a-zA-Z0-9_]/.test(line)) {  // Allows letters, numbers, and underscores
        errors.push(`Device name '${line}' at line ${index + 1} contains special characters. Only letters, numbers, and underscores are allowed.`);
        return false;
    }

    registeredDeviceNames.add(line);
    return true;
}

export function validateDevices(deviceDataArray) {
    const errors = [];
    const deviceNameToType = {}; // Dictionary to store device names and their corresponding types
    const registeredDeviceNames = new Set(); // Set to track registered device names
    let currentDeviceType = null; // Track the current device type
    let currentDeviceModel = null; // Track the current device model

    deviceDataArray.forEach((line, index) => {
        line = line.trim();

        // Skip lines that start with 'QTY:' or contain '()'
        if (line.startsWith('QTY:') || line.includes('(')) {
            return;
        }

        let hasErrors = false;

        if (line.startsWith('NAME')) {
            //! Validate 'NAME:' prefix and the device model
            if (!checkNamePrefix(line, index, errors)) hasErrors = true;
            currentDeviceModel = line.substring(5).trim(); // Extract the part after 'NAME:'
            if (!validateDeviceModel(currentDeviceModel, index, errors)) hasErrors = true;

            // Check if the device model is in DevicesInSceneControl
            for (const [deviceType, models] of Object.entries(DevicesInSceneControl)) {
                if (Array.isArray(models) && models.includes(currentDeviceModel)) {
                    currentDeviceType = deviceType;
                    break;
                } else if (typeof models === 'object') {
                    for (const subModels of Object.values(models)) {
                        if (subModels.includes(currentDeviceModel)) {
                            currentDeviceType = deviceType;
                            break;
                        }
                    }
                }
            }

            // If we found a matching device type, record the device name with the correct type
            if (currentDeviceType) {
                deviceNameToType[currentDeviceModel] = currentDeviceType; // Use the actual device name as the key
            } else {
                errors.push(`Device model '${currentDeviceModel}' at line ${index + 1} is not recognized.`);
            }
        } else if (!hasErrors) {
            //! Check if the line matches a known device model but is missing 'NAME:'
            if (!checkMissingNamePrefix(line, index, errors, deviceNameToType)) hasErrors = true;

            //! Validate device name for uniqueness and format
            if (!validateDeviceName(line, index, errors, registeredDeviceNames)) return;

            // Record the device name with the correct type in deviceNameToType
            if (currentDeviceType) {
                deviceNameToType[line] = currentDeviceType; // Use the actual device name as the key
            }
        }
    });

    console.log('Errors found:', errors);  // Debugging line

    return { errors, deviceNameToType };
}