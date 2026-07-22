/*
=================================
GLOBAL DATA
=================================
*/

let historyData = [];

/*
=================================
LOAD HISTORY
=================================
*/

function loadHistory() {

    historyData =
        JSON.parse(
            localStorage.getItem(
                "newsHistory"
            )
        ) || [];

    renderTable(historyData);
}

/*
=================================
RENDER TABLE
=================================
*/

function renderTable(data) {

    const table =
        document.getElementById(
            "historyTable"
        );

    table.innerHTML = "";

    if (data.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="5"
                    class="empty">
                    No history available
                </td>
            </tr>
        `;

        return;
    }

    data.forEach((item, index) => {

        const predictionClass =
            item.prediction &&
            item.prediction
                .toLowerCase()
                .includes("real")
                ? "real"
                : "fake";

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>
                <span class="${predictionClass}">
                    ${item.prediction}
                </span>
            </td>

            <td>
                ${item.confidence || 0}%
            </td>

            <td>
                ${item.sentiment || "Neutral"}
            </td>

            <td>
                ${item.date || "-"}
            </td>

            <td>

                <button
                    class="delete-btn"
                    onclick="deleteRecord(${index})">

                    Delete

                </button>

            </td>
        `;

        table.appendChild(row);
    });
}

/*
=================================
SEARCH + FILTER
=================================
*/

function filterHistory() {

    const searchValue =
        document.getElementById(
            "searchInput"
        ).value.toLowerCase();

    const filterValue =
        document.getElementById(
            "predictionFilter"
        ).value.toLowerCase();

    const filtered =
        historyData.filter(item => {

            const prediction =
                (
                    item.prediction || ""
                ).toLowerCase();

            const searchMatch =
                prediction.includes(
                    searchValue
                );

            const filterMatch =
                filterValue === ""
                ||
                prediction.includes(
                    filterValue
                );

            return (
                searchMatch &&
                filterMatch
            );
        });

    renderTable(filtered);
}

/*
=================================
DELETE RECORD
=================================
*/

function deleteRecord(index) {

    const confirmDelete =
        confirm(
            "Delete this record?"
        );

    if (!confirmDelete)
        return;

    historyData.splice(
        index,
        1
    );

    localStorage.setItem(
        "newsHistory",
        JSON.stringify(
            historyData
        )
    );

    renderTable(historyData);
}

/*
=================================
CLEAR ALL HISTORY
=================================
*/

function clearHistory() {

    const confirmClear =
        confirm(
            "Clear entire history?"
        );

    if (!confirmClear)
        return;

    localStorage.removeItem(
        "newsHistory"
    );

    historyData = [];

    renderTable(historyData);
}

/*
=================================
EXPORT CSV
=================================
*/

function exportCSV() {

    if (
        historyData.length === 0
    ) {

        alert(
            "No data available."
        );

        return;
    }

    let csvContent =

        "Prediction,Confidence,Sentiment,Date\n";

    historyData.forEach(item => {

        csvContent +=

            `${item.prediction},` +
            `${item.confidence},` +
            `${item.sentiment},` +
            `${item.date}\n`;

    });

    const blob =
        new Blob(
            [csvContent],
            {
                type:
                "text/csv;charset=utf-8;"
            }
        );

    const link =
        document.createElement(
            "a"
        );

    const url =
        URL.createObjectURL(
            blob
        );

    link.setAttribute(
        "href",
        url
    );

    link.setAttribute(
        "download",
        "analysis_history.csv"
    );

    document.body.appendChild(
        link
    );

    link.click();

    document.body.removeChild(
        link
    );
}

/*
=================================
SORT BY CONFIDENCE
=================================
*/

function sortByConfidence() {

    historyData.sort(
        (a, b) =>
        b.confidence -
        a.confidence
    );

    renderTable(historyData);
}

/*
=================================
SORT BY DATE
=================================
*/

function sortByDate() {

    historyData.sort(
        (a, b) =>
        new Date(b.date) -
        new Date(a.date)
    );

    renderTable(historyData);
}