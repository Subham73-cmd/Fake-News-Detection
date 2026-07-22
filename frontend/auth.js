// Local FastAPI
// const API_URL = "http://localhost:8000/predict";

// Vercel Backend
const API_URL = "https://fake-news-detection-neon-nu.vercel.app/predict";

async function analyzeNews() {

    const newsText = document.getElementById("newsText").value.trim();

    const loader = document.getElementById("loader");

    const prediction = document.getElementById("predictionText");

    const confidence = document.getElementById("confidence");

    const sentiment = document.getElementById("sentiment");

    const credibility = document.getElementById("credibility");

    const highlightedText =
        document.getElementById("highlightedText");

    if (!newsText) {

        alert("Please enter news content.");

        return;
    }

    // Highlight suspicious words

    const suspiciousWords = [
        "shocking",
        "breaking",
        "miracle",
        "secret",
        "exclusive",
        "viral",
        "unbelievable",
        "guaranteed"
    ];

    let highlighted = newsText;

    suspiciousWords.forEach(word => {

        const regex = new RegExp(`\\b${word}\\b`, "gi");

        highlighted = highlighted.replace(
            regex,
            `<span class="fake-highlight">$&</span>`
        );
    });

    highlightedText.innerHTML = highlighted;

    loader.classList.remove("hidden");

    prediction.innerHTML = "⏳ Analyzing...";

    confidence.innerHTML = "";

    sentiment.innerHTML = "";

    credibility.innerHTML = "";

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                text: newsText

            })

        });

        if (!response.ok) {

            throw new Error("Server Error");

        }

        const data = await response.json();

        if (data.consensus_label === "Fake News") {

            prediction.innerHTML = "🚨 FAKE NEWS";

            prediction.style.color = "#ff4d4d";

        } else {

            prediction.innerHTML = "✅ REAL NEWS";

            prediction.style.color = "#28a745";

        }

        confidence.innerHTML =
            "Fake Votes : " + data.fake_votes;

        sentiment.innerHTML =
            "Real Votes : " + data.real_votes;

        credibility.innerHTML =
            "Models Used : " + data.votes.length;

        saveToLocalHistory(data);

    }

    catch (error) {

        console.error(error);

        prediction.innerHTML = "❌ Backend Connection Failed";

        prediction.style.color = "red";

        confidence.innerHTML = "";

        sentiment.innerHTML = "";

        credibility.innerHTML = "";

    }

    finally {

        loader.classList.add("hidden");

    }

}

function saveToLocalHistory(data) {

    let history =
        JSON.parse(localStorage.getItem("newsHistory")) || [];

    history.push({

        date: new Date().toLocaleString(),

        prediction: data.consensus_label,

        confidence:
            Math.round(
                (Math.max(
                    data.fake_votes,
                    data.real_votes
                ) / data.votes.length) * 100
            ),

        sentiment:
            data.consensus_label === "Real News"
                ? "Positive"
                : "Negative",

        fakeVotes: data.fake_votes,

        realVotes: data.real_votes

    });

    localStorage.setItem(
        "newsHistory",
        JSON.stringify(history)
    );

}
