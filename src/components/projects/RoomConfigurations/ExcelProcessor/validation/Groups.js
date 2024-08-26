function checkNamePrefix(line, index, errors) {
    if (!line.startsWith('NAME:')) {
        errors.push(`Line ${index + 1} starts with 'NAME' but is missing a colon. It should be 'NAME:'.`);
        return false;
    }
    return true;
}

function validateGroupName(groupName, index, errors, registeredGroupNames) {
    if (!groupName) {
        errors.push(`Line ${index + 1} has 'NAME:' but no group name is provided. Please enter a valid group name.`);
        return false;
    }

    if (registeredGroupNames.has(groupName)) {
        errors.push(`Duplicate group name '${groupName}' found at line ${index + 1}. Each group name must be unique.`);
        return false;
    }

    registeredGroupNames.add(groupName);
    return true;
}

function validateDeviceNameInGroup(deviceName, index, errors, deviceNameToType) {
    if (/\s/.test(deviceName)) {
        errors.push(`Device name '${deviceName}' at line ${index + 1} contains spaces. Consider using underscores ('_') or camelCase instead.`);
        return false;
    }

    if (/[^a-zA-Z0-9_]/.test(deviceName)) {
        errors.push(`Device name '${deviceName}' at line ${index + 1} contains special characters. Only letters, numbers, and underscores are allowed.`);
        return false;
    }

    if (!deviceNameToType[deviceName]) {  // Now checking against the actual device names
        errors.push(`Device name '${deviceName}' at line ${index + 1} is not recognized. It should match one of the devices already added.`);
        return false;
    }

    return true;
}

export function validateGroups(groupDataArray, deviceNameToType) {
    const errors = [];
    const registeredGroupNames = new Set(); // Set to track registered group names
    let currentGroupName = null;

    console.log('----------------------------------------------------------------');
    console.log(deviceNameToType);

    groupDataArray.forEach((line, index) => {
        line = line.trim();

        if (line.startsWith('NAME')) {
            if (!checkNamePrefix(line, index, errors)) return;
            currentGroupName = line.substring(5).trim(); // Extract the part after 'NAME:'
            if (!validateGroupName(currentGroupName, index, errors, registeredGroupNames)) return;
        } else if (line.startsWith('DEVICE CONTROL:')) {
            return; // Skip this line as it just indicates the start of device names
        } else if (currentGroupName && line) {
            if (!validateDeviceNameInGroup(line, index, errors, deviceNameToType)) return; // Check against deviceNameToType
        }
    });

    console.log('Errors found:', errors);  // Debugging line

    return errors;
}