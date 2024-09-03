//! Check for 'NAME' without a colon
function checkNamePrefix(line, errors) {
    if (!line.startsWith('NAME:')) {
        errors.push(`KASTA GROUP: The line '${line}' is missing a colon after 'NAME'. It should be formatted as 'NAME:'.`);
        return false;
    }
    return true;
}

function validateGroupName(groupName, errors, deviceNameToGroup, registeredGroupNames) {
    //! Check for 'NAME' without a colon
    if (!groupName) {
        errors.push(`KASTA GROUP: The line with 'NAME:' is missing a group name. Please enter a valid group name.`);
        return false;
    }

    //! Check for disallowed special characters in the group name, allowing spaces
    if (/[^a-zA-Z0-9_ ]/.test(groupName)) {
        errors.push(`KASTA GROUP: The group name '${groupName}' contains special characters. Only letters, numbers, underscores, and spaces are allowed.`);
        return false;
    }

    if (!deviceNameToGroup[groupName]) {
        deviceNameToGroup[groupName] = new Set(); // Initialize a new Set for this group
    }

    registeredGroupNames.add(groupName);
    return true;
}

function validateDeviceNameInGroup(deviceName, errors, deviceNameToType, deviceNameToGroup, currentGroupName) {
    if (!currentGroupName || !deviceNameToGroup[currentGroupName]) {
        errors.push(`KASTA GROUP: There was an error processing the group '${currentGroupName}'.`);
        return false;
    }

    //! Check if the device name contains any spaces
    if (/\s/.test(deviceName)) {
        errors.push(`KASTA GROUP: The device name '${deviceName}' in group '${currentGroupName}' contains spaces. Please check the device name.`);
        return false;
    }

    //! Check for disallowed special characters in the device name
    if (/[^a-zA-Z0-9_]/.test(deviceName)) {
        errors.push(`KASTA GROUP: The device name '${deviceName}' in group '${currentGroupName}' contains special characters. Only letters, numbers, and underscores are allowed.`);
        return false;
    }

    //! Check if the device name is not recognized
    if (!deviceNameToType[deviceName]) {
        errors.push(`KASTA GROUP: The device name '${deviceName}' in group '${currentGroupName}' is not recognized. It should match one of the devices already added.`);
        return false;
    }

    //! Check if the device name is already in the group (duplicate device name)
    if (deviceNameToGroup[currentGroupName].has(deviceName)) {
        errors.push(`KASTA GROUP: The device name '${deviceName}' is duplicated in the group '${currentGroupName}'. Each device name within a group must be unique.`);
        return false;
    }

    // Add the device name to the group
    deviceNameToGroup[currentGroupName].add(deviceName);

    return true;
}

export function validateGroups(groupDataArray, deviceNameToType) {
    const errors = [];
    const deviceNameToGroup = {}; // Store device names within each group
    const registeredGroupNames = new Set(); // track registered group names
    let currentGroupName = null;

    groupDataArray.forEach((line) => {
        line = line.trim();

        if (line.startsWith('NAME')) {
            if (!checkNamePrefix(line, errors)) return;
            currentGroupName = line.substring(5).trim(); // Extract the part after 'NAME:'
            if (!validateGroupName(currentGroupName, errors, deviceNameToGroup, registeredGroupNames)) return;
        } else if (line.startsWith('DEVICE CONTROL')) {
            return; // Skip this line as it just indicates the start of device names
        } else if (currentGroupName && line) {
            if (!validateDeviceNameInGroup(line, errors, deviceNameToType, deviceNameToGroup, currentGroupName)) return; // Check against deviceNameToType
        }
    });

    console.log('Errors found:', errors);  // Debugging line
    // console.log(deviceNameToGroup); // Debugging the group-device mapping

    return { errors, registeredGroupNames };
}