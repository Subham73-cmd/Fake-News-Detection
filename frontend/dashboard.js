/*
=================================
LOAD USER EMAIL
=================================
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const userEmail =
            localStorage.getItem(
                "userEmail"
            );

        const userElement =
            document.getElementById(
                "userEmail"
            );

        if(userElement){

            userElement.innerHTML =
                userEmail ||
                "Guest User";
        }

        loadDashboard();
    }
);

/*
=================================
LOAD DASHBOARD DATA
=================================
*/

function loadDashboard(){

    const history =
        JSON.parse(
            localStorage.getItem(
                "newsHistory"
            )
        ) || [];

    updateStatistics(history);

    loadActivity(history);

    createPieChart(history);

    createBarChart(history);
}

/*
=================================
STATISTICS
=================================
*/

function updateStatistics(history){

    const total =
        history.length;

    let realNews = 0;
    let fakeNews = 0;
    let confidenceSum = 0;

    history.forEach(item => {

        if(
            item.prediction &&
            item.prediction
            .toLowerCase()
            .includes("real")
        ){

            realNews++;

        }else{

            fakeNews++;
        }

        confidenceSum +=
            Number(
                item.confidence
            ) || 0;
    });

    const avgConfidence =
        total > 0
        ? (confidenceSum / total)
            .toFixed(2)
        : 0;

    document.getElementById(
        "totalAnalyses"
    ).innerHTML = total;

    document.getElementById(
        "realNews"
    ).innerHTML = realNews;

    document.getElementById(
        "fakeNews"
    ).innerHTML = fakeNews;

    document.getElementById(
        "avgConfidence"
    ).innerHTML =
        avgConfidence + "%";
}

/*
=================================
RECENT ACTIVITY TABLE
=================================
*/

function loadActivity(history){

    const table =
        document.getElementById(
            "activityTable"
        );

    if(!table) return;

    table.innerHTML = "";

    const latest =
        history.slice(-10).reverse();

    latest.forEach(item => {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>
                ${item.prediction || "-"}
            </td>

            <td>
                ${item.confidence || 0}%
            </td>

            <td>
                ${item.date || "-"}
            </td>
        `;

        table.appendChild(row);
    });
}

/*
=================================
PIE CHART
=================================
*/

let pieChartInstance;

function createPieChart(history){

    const canvas =
        document.getElementById(
            "pieChart"
        );

    if(!canvas) return;

    let real = 0;
    let fake = 0;

    history.forEach(item => {

        if(
            item.prediction &&
            item.prediction
            .toLowerCase()
            .includes("real")
        ){

            real++;

        }else{

            fake++;
        }
    });

    if(pieChartInstance){

        pieChartInstance.destroy();
    }

    pieChartInstance =
        new Chart(canvas, {

        type:"pie",

        data:{
            labels:[
                "Real News",
                "Fake News"
            ],

            datasets:[{

                data:[
                    real,
                    fake
                ],

                backgroundColor:[
                    "#22c55e",
                    "#ef4444"
                ]
            }]
        },

        options:{
            responsive:true
        }
    });
}

/*
=================================
BAR CHART
CONFIDENCE TREND
=================================
*/

let barChartInstance;

function createBarChart(history){

    const canvas =
        document.getElementById(
            "barChart"
        );

    if(!canvas) return;

    const labels =
        history
        .slice(-7)
        .map((item,index)=>
            "Analysis " +
            (index+1)
        );

    const confidenceData =
        history
        .slice(-7)
        .map(item =>
            item.confidence || 0
        );

    if(barChartInstance){

        barChartInstance.destroy();
    }

    barChartInstance =
        new Chart(canvas,{

        type:"bar",

        data:{

            labels:labels,

            datasets:[{

                label:
                "Confidence %",

                data:
                confidenceData,

                backgroundColor:
                "#38bdf8"
            }]
        },

        options:{

            responsive:true,

            scales:{

                y:{

                    beginAtZero:true,

                    max:100
                }
            }
        }
    });
}

/*
=================================
REFRESH DASHBOARD
=================================
*/

function refreshDashboard(){

    loadDashboard();
}