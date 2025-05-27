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
        'Partial support ends', 
        'Support ends',
    ];

    // Consts used for different statuses
    const STATUS_FULL_SUPPORT = 'Full support';
    const STATUS_PARTIAL_SUPPORT = 'Partial support';
    const STATUS_UNSUPPORTED = 'Unsupported';
    const STATUS_PRE_RELEASE = 'Pre-release';
    const STATUS_IN_DEVELOPMENT = 'In development';
    const STATUS_PLANNED = 'Planned';
    const STATUS_INVALID_DATES = 'Invalid Dates';
    const STATUS_UNKNOWN = 'Unknown';

    // Map of status to css class
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
            const releaseDate = new Date(record.releaseDate);
            const partialSupportDate = new Date(record.partialSupport);
            const endOfLifeDate = new Date(record.supportEnds);

            // Status can be manually set, which it should be for "Pre-release" and "In development"
            const dataStatus = record.status;

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
                record.supportLength, 
                record.releaseDate, 
                record.partialSupport, 
                record.supportEnds,
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
