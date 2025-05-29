(function() {
    // The id of the element used to house the table
    // Must have a data-url attribute pointing to the url where data json is fetched from
    const elementId = 'supportTimeline';

    // The text used in each header cell
    const headers = [
        'Status', 
        'CMS Version', 
        'Support length', 
        'Release date', 
        'Partial support starts', 
        'Support ends',
    ];

    // Consts used for different statuses
    const STATUS_FULL = 'Full support';
    const STATUS_PARTIAL = 'Partial support';
    const STATUS_EOL = 'End of life';
    const STATUS_PRE = 'Pre-release';
    const STATUS_DEV = 'In development';
    const STATUS_PLANNED = 'Planned';
    const STATUS_INVALID = 'Invalid Dates';
    const STATUS_UNKNOWN = 'Unknown';

    // Map of status to css class
    const statusClasses = [
        [STATUS_FULL, 'status-full'],
        [STATUS_PARTIAL, 'status-partial'],
        [STATUS_EOL, 'status-eol'],
        [STATUS_PRE, 'status-pre'],
        [STATUS_DEV, 'status-dev'],
        [STATUS_PLANNED, 'status-planned'],
        [STATUS_INVALID, 'status-invalid'],
        [STATUS_UNKNOWN, 'status-unknown'],
    ];

    /**
     * Fetches data from the URL specified in data-url of the target element
     */
    async function fetchData() {
        const div = document.getElementById(elementId);
        const url = div.getAttribute('data-url');
        const response = await fetch(url);
        const resonseJson = await response.json();
        return resonseJson.data;
    }

    /**
     * Create a date object of the current NZ time
     */
    function getCurrentDateNZT() {
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
        return new Date(
            getPart('year'),
            getPart('month') - 1,
            getPart('day'),
            getPart('hour'),
            getPart('minute'),
            getPart('second'),
        );
    }

    /**
     * Check if a date string contains a day part
     */
    function dateStrContainsDay(dateStr) {
        return dateStr.match(/^\d{4}-\d{2}-\d{2}$/)
    }

    /**
     * Convert an ISO-8601 (YYYY-MM-DD) date string to a date object
     * or convert a (YYYY-MM) to a date with the day part set to "28"
     */
    function createDate(dateStr) {
        if (!dateStrContainsDay(dateStr)) {
            return new Date(dateStr + '-28');
        } else {
            return new Date(dateStr);
        }
    }

    /**
     * Format an ISO-8601 (YYYY-MM-DD) date string to "<Day> <Month> <Year>"
     * or convert a (YYYY-MM) date string to "<Month> <Year>"
     */
    function formatDateStr(dateStr) {
        const options = {
            year: 'numeric',
            month: 'long',
        }
        if (dateStrContainsDay(dateStr)) {
            options.day = 'numeric';
        }
        const formatter = new Intl.DateTimeFormat([], options);
        return formatter.format(createDate(dateStr));
    }

    /**
     * Renders the support timeline table into the element with the specified ID
     */
    async function renderTable(selector) {
        const div = document.getElementById(elementId);
        const table = document.createElement('table');
        div.appendChild(table);
        table.classList.add('policy-table');

        // Create header content
        const thead = document.createElement('thead');
        table.appendChild(thead);
        const headerRow = document.createElement('tr');
        thead.appendChild(headerRow);
        for (const item of headers) {
            const headerCell = document.createElement('th');
            headerCell.innerText = item;
            headerRow.appendChild(headerCell);
        }

        // Create body content
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);
        const data = await fetchData();
        const currentDateNZT = getCurrentDateNZT();
        let currentMajor = null;

        for (const record of data) {
            const version = record.version;
            const majorVersion = version.split('.')[0];

            if (majorVersion !== currentMajor) {
                const cmsRow = document.createElement('tr');
                const cmsCell = document.createElement('td');
                cmsCell.innerText = 'CMS ' + majorVersion;
                cmsCell.colSpan = 6;
                cmsCell.classList.add('cms-version');
                cmsRow.appendChild(cmsCell);
                tbody.appendChild(cmsRow);
                currentMajor = majorVersion;
            }

            const row = document.createElement('tr');
            const releaseDate = createDate(record.releaseDate);
            const partialSupportDate = createDate(record.partialSupport);
            const endOfLifeDate = createDate(record.supportEnds);

            // Status can be manually set, which it should be for "Pre-release" and "In development"
            const dataStatus = record.status;

            // Dynamically work out status based on date
            let status = STATUS_UNKNOWN;
            if (dataStatus) {
                status = dataStatus;
            } else if (!releaseDate || !partialSupportDate || !endOfLifeDate) {
                status = STATUS_INVALID;
            } else if (currentDateNZT >= releaseDate && currentDateNZT < partialSupportDate) {
                status = STATUS_FULL;
            } else if (currentDateNZT >= partialSupportDate && currentDateNZT < endOfLifeDate) {
                status = STATUS_PARTIAL;
            } else if (currentDateNZT >= endOfLifeDate) {
                status = STATUS_EOL;
                // If more than 12 months past EOL, then do not show
                const twelveMonthsAfterEOL = new Date(endOfLifeDate);
                twelveMonthsAfterEOL.setFullYear(twelveMonthsAfterEOL.getFullYear() + 1);
                if (currentDateNZT >= twelveMonthsAfterEOL) {
                    continue;
                }
            } else if (currentDateNZT < endOfLifeDate) {
                status = STATUS_PLANNED;
            }

            // Create and append cells for the row
            const cellContent = [
                status,
                version,
                record.supportLength,
                formatDateStr(record.releaseDate),
                formatDateStr(record.partialSupport),
                formatDateStr(record.supportEnds),
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

            tbody.appendChild(row);
        }
    }

    document.addEventListener('DOMContentLoaded', () => renderTable());
})();
