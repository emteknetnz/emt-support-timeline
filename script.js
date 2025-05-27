(function() {
    const STATUS_FULL_SUPPORT = 'Full support';
    const STATUS_PARTIAL_SUPPORT = 'Partial support';
    const STATUS_UNSUPPORTED = 'Unsupported';
    const STATUS_PRE_RELEASE = 'Pre-release';
    const STATUS_IN_DEVELOPMENT = 'In development';
    const STATUS_PLANNED = 'Planned';
    const STATUS_INVALID_DATES = 'Invalid Dates';
    const STATUS_UNKNOWN = 'Unknown';

    const statusClasses = [
        [STATUS_FULL_SUPPORT, 'status-full-support'],
        [STATUS_PARTIAL_SUPPORT, 'status-partial-support'],
        [STATUS_UNSUPPORTED, 'status-unsupported'],
        [STATUS_PRE_RELEASE, 'status-pre-release'],
        [STATUS_IN_DEVELOPMENT, 'status-in-development'],
        [STATUS_PLANNED, 'status-planned'],
        [STATUS_INVALID_DATES, 'status-invalid-dates'],
        [STATUS_UNKNOWN, 'status-unknown'],
    ];

    // Helper to parse date strings (e.g., "January 1 2020", "October 2024") into Date objects
    function parseDate(dateString) {
        let formattedDateString = dateString;
        const parts = dateString.split(' ');
        // "Month Year" format
        if (parts.length === 2) {
            // Assume 15th on the month for consistency
            formattedDateString = parts[0] + ' 15, ' + parts[1];
        }
        const date = new Date(formattedDateString);
        if (isNaN(date.getTime())) {
            console.error('Failed to parse date: "' + dateString + '" -> "' + formattedDateString + '"');
            return null;
        }
        return date;
    }

    function renderTable(selector) {
        const tbody = document.querySelector(selector);
        
        // Get the current date in NZ time
        const formatter = new Intl.DateTimeFormat([], {
            timeZone: 'Pacific/Auckland',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        });
        const parts = formatter.formatToParts(new Date());
        const getPart = (part) => parts.filter(obj => obj.type == part)[0].value;
        const currentDateNZT = new Date(
            getPart('year'),
            getPart('month') - 1,
            getPart('day'),
            getPart('hour'),
            getPart('minute'),
            getPart('second'),
        );
        
        for (const [index, dataItem] of window.__supportTimelineData.entries()) {
            const row = document.createElement('tr');
            const version = dataItem.version;
            const majorVersion = version.split('.')[0];
            const releaseDate = parseDate(dataItem.releaseDate);
            const partialSupportDate = parseDate(dataItem.partialSupportStarts);
            const endOfLifeDate = parseDate(dataItem.supportEnds);

            // Status can be manually set, which it should be for "Pre-release" and "In development"
            const dataStatus = dataItem.status;

            // Dynamically work out status based on date
            let status = STATUS_UNKNOWN;
            if (dataStatus) {
                status = dataStatus;
            } else if (!releaseDate || !partialSupportDate || !endOfLifeDate) {
                status = STATUS_INVALID_DATES;
            } else if (currentDateNZT >= releaseDate && currentDateNZT < partialSupportDate) {
                status = STATUS_FULL_SUPPORT;
            } else if (currentDateNZT >= partialSupportDate && currentDateNZT < endOfLifeDate) {
                status = STATUS_PARTIAL_SUPPORT;
            } else if (currentDateNZT >= endOfLifeDate) {
                status = STATUS_UNSUPPORTED;
            } else if (currentDateNZT < endOfLifeDate) {
                status = STATUS_PLANNED;
            }

            // Create and append cells for the row
            const cellContent = [
                status, 
                version, 
                dataItem.supportLength, 
                dataItem.releaseDate, 
                dataItem.partialSupportStarts, 
                dataItem.supportEnds,
            ];
            for (const item of cellContent) {
                const cell = document.createElement('td');
                cell.innerText = item;
                row.appendChild(cell);
            }

            // Apply status background class
            row.classList.add('status');
            for (const arr of statusClasses) {
                const [_status, className] = arr;
                if (status === _status) {
                    row.classList.add(className);
                }
            }

            // Apply major version separator if needed
            const nextDataItem = window.__supportTimelineData[index + 1]; 
            if (nextDataItem && nextDataItem.version.split('.')[0] !== majorVersion) {
                row.classList.add('major-version-separator');
            }

            tbody.appendChild(row);
        }
    }

    document.addEventListener('DOMContentLoaded', () => renderTable('#policyTable tbody'));
})();
