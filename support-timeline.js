const STATUS_FULL_SUPPORT = "Full support";
const STATUS_PARTIAL_SUPPORT = "Partial support";
const STATUS_UNSUPPORTED = "Unsupported";
const STATUS_PRE_RELEASE = "Pre-release";
const STATUS_IN_DEVELOPMENT = "In development";
const STATUS_PLANNED = "Planned";
const STATUS_INVALID_DATES = "Invalid Dates";
const STATUS_UNKNOWN = "Unknown";

const SUPPORT_LENGTH_STANDARD = "Standard";
const SUPPORT_LENGTH_EXTENDED = "Extended";

const versionData = [
    {
        version: '4.12',
        releaseDate: 'January 26 2023',
        partialSupportStarts: 'July 26 2023',
        supportEnds: 'January 26 2024',
        statusType: SUPPORT_LENGTH_STANDARD,
        supportLength: SUPPORT_LENGTH_STANDARD
    },
    {
        version: '4.13',
        releaseDate: 'April 26 2023',
        partialSupportStarts: 'April 17 2024',
        supportEnds: 'June 2025',
        statusType: SUPPORT_LENGTH_STANDARD,
        supportLength: SUPPORT_LENGTH_EXTENDED
    },
    {
        version: '5.2',
        releaseDate: 'April 15 2024',
        partialSupportStarts: 'October 2024',
        supportEnds: 'April 2025',
        statusType: SUPPORT_LENGTH_STANDARD,
        supportLength: SUPPORT_LENGTH_STANDARD
    },
    {
        version: '5.3',
        releaseDate: 'November 2024',
        partialSupportStarts: 'May 2025',
        supportEnds: 'November 2025',
        statusType: SUPPORT_LENGTH_STANDARD,
        supportLength: SUPPORT_LENGTH_STANDARD
    },
    {
        version: '5.4',
        releaseDate: 'April 2025',
        partialSupportStarts: 'April 2026',
        supportEnds: 'April 2027',
        statusType: SUPPORT_LENGTH_STANDARD,
        supportLength: SUPPORT_LENGTH_EXTENDED
    },
    {
        version: '6.0',
        releaseDate: 'June 2025',
        partialSupportStarts: 'December 2025',
        supportEnds: 'June 2026',
        statusType: STATUS_PRE_RELEASE,
        supportLength: SUPPORT_LENGTH_STANDARD
    },
    {
        version: '6.1',
        releaseDate: 'October 2025',
        partialSupportStarts: 'April 2026',
        supportEnds: 'October 2026',
        statusType: STATUS_IN_DEVELOPMENT,
        supportLength: SUPPORT_LENGTH_STANDARD
    },
    {
        version: '6.2',
        releaseDate: 'April 2026',
        partialSupportStarts: 'October 2026',
        supportEnds: 'April 2027',
        statusType: STATUS_PLANNED,
        supportLength: SUPPORT_LENGTH_STANDARD
    },
    {
        version: '6.3',
        releaseDate: 'October 2026',
        partialSupportStarts: 'April 2027',
        supportEnds: 'October 2027',
        statusType: STATUS_PLANNED,
        supportLength: SUPPORT_LENGTH_STANDARD
    },
    {
        version: '6.4',
        releaseDate: 'April 2027',
        partialSupportStarts: 'April 2028',
        supportEnds: 'April 2029',
        statusType: STATUS_PLANNED,
        supportLength: SUPPORT_LENGTH_EXTENDED
    },
    {
        version: '7.0',
        releaseDate: 'April 2027',
        partialSupportStarts: 'October 2027',
        supportEnds: 'April 2028',
        statusType: STATUS_PLANNED,
        supportLength: SUPPORT_LENGTH_STANDARD
    },
];

// Helper to parse date strings (e.g., "January 1 2020", "October 2024") into Date objects
function parseDate(dateString) {
    let formattedDateString = dateString;
    const parts = dateString.split(' ');
    if (parts.length === 2) { // "Month Year" format
        formattedDateString = parts[0] + ' 15, ' + parts[1]; // Assume 15th for consistency
    }
    const date = new Date(formattedDateString);

    if (isNaN(date.getTime())) {
        console.error("Failed to parse date: \"" + dateString + "\" -> \"" + formattedDateString + "\"");
        return null;
    }
    return date;
}

function renderTable(selector) {
    const tbody = document.querySelector(selector);
    const currentDate = new Date(); // Get current date for comparison

    for (const [index, dataItem] of versionData.entries()) {
        const row = document.createElement('tr');
        const version = dataItem.version;
        const majorVersion = version.split('.')[0];

        const releaseDate = parseDate(dataItem.releaseDate);
        const partialSupportDate = parseDate(dataItem.partialSupportStarts);
        const endOfLifeDate = parseDate(dataItem.supportEnds);

        let status = STATUS_UNKNOWN;
        let supportLength = dataItem.supportLength;

        if (!releaseDate || !partialSupportDate || !endOfLifeDate) {
            status = STATUS_INVALID_DATES;
        } else {
            switch (dataItem.statusType) {
                case STATUS_PRE_RELEASE:
                    if (currentDate < releaseDate) {
                        status = STATUS_PRE_RELEASE;
                    } else if (currentDate >= releaseDate && currentDate < partialSupportDate) {
                        status = STATUS_FULL_SUPPORT;
                    } else if (currentDate >= partialSupportDate && currentDate < endOfLifeDate) {
                        status = STATUS_PARTIAL_SUPPORT;
                    } else {
                        status = STATUS_UNSUPPORTED;
                    }
                    break;
                case STATUS_IN_DEVELOPMENT: // Changed case to use STATUS_IN_DEVELOPMENT directly
                    if (currentDate < releaseDate) {
                        status = STATUS_IN_DEVELOPMENT;
                    } else if (currentDate >= releaseDate && currentDate < partialSupportDate) {
                        status = STATUS_FULL_SUPPORT;
                    } else if (currentDate >= partialSupportDate && currentDate < endOfLifeDate) {
                        status = STATUS_PARTIAL_SUPPORT;
                    } else {
                        status = STATUS_UNSUPPORTED;
                    }
                    break;
                case STATUS_PLANNED:
                    if (currentDate < releaseDate) {
                        status = STATUS_PLANNED;
                    } else if (currentDate >= releaseDate && currentDate < partialSupportDate) {
                        status = STATUS_FULL_SUPPORT;
                    } else if (currentDate >= partialSupportDate && currentDate < endOfLifeDate) {
                        status = STATUS_PARTIAL_SUPPORT;
                    } else {
                        status = STATUS_UNSUPPORTED;
                    }
                    break;
                case SUPPORT_LENGTH_STANDARD:
                default:
                    if (currentDate >= endOfLifeDate) {
                        status = STATUS_UNSUPPORTED;
                    } else if (currentDate >= partialSupportDate) {
                        status = STATUS_PARTIAL_SUPPORT;
                    } else if (currentDate >= releaseDate) {
                        status = STATUS_FULL_SUPPORT;
                    } else {
                        status = STATUS_PLANNED;
                    }
                    break;
            }
        }

        // Create and append cells for the row
        const statusCell = document.createElement('td');
        statusCell.innerText = status;
        row.appendChild(statusCell);

        const versionCell = document.createElement('td');
        versionCell.innerText = version;
        row.appendChild(versionCell);

        const supportLengthCell = document.createElement('td');
        supportLengthCell.innerText = supportLength;
        row.appendChild(supportLengthCell);

        const releaseDateCell = document.createElement('td');
        releaseDateCell.innerText = dataItem.releaseDate;
        row.appendChild(releaseDateCell);

        const partialSupportStartsCell = document.createElement('td');
        partialSupportStartsCell.innerText = dataItem.partialSupportStarts;
        row.appendChild(partialSupportStartsCell);

        const supportEndsCell = document.createElement('td');
        supportEndsCell.innerText = dataItem.supportEnds;
        row.appendChild(supportEndsCell);

        // Apply status background class
        row.classList.add('status');
        switch (status) {
            case STATUS_FULL_SUPPORT: row.classList.add('status-full-support'); break;
            case STATUS_PARTIAL_SUPPORT: row.classList.add('status-partial-support'); break;
            case STATUS_UNSUPPORTED: row.classList.add('status-unsupported'); break;
            case STATUS_PRE_RELEASE: row.classList.add('status-pre-release'); break;
            case STATUS_IN_DEVELOPMENT: row.classList.add('status-in-development'); break;
            case STATUS_PLANNED: row.classList.add('status-planned'); break;
            case STATUS_INVALID_DATES: row.classList.add('status-invalid-dates'); break;
            case STATUS_UNKNOWN: row.classList.add('status-unknown'); break;
        }

        // Apply major version separator if needed
        const nextDataItem = versionData[index + 1]; 
        if (nextDataItem && nextDataItem.version.split('.')[0] !== majorVersion) {
            row.classList.add('major-version-separator');
        }

        tbody.appendChild(row);
    }
}

document.addEventListener('DOMContentLoaded', () => renderTable('#policyTable tbody'));
