# 🚀 RapidQuest Hackathon: AI-Powered Query Management & Response System

## 🎯 Challenge Addressed

**Challenge 3:** Audience Query Management & Response System.

This project implements a unified, intelligent platform to centralize audience queries from various channels (simulated via an input form) and uses a Large Language Model (LLM) to instantly categorize, prioritize, and analyze sentiment, transforming raw text into actionable data for support agents.

---

## 🛠️ Tech Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React (Vite/CRA) + Bootstrap 5 | Modern, component-based UI for dynamic interaction and rapid, responsive design. |
| **Backend** | Spring Boot (Java) | Enterprise-grade stability, robust REST API creation, and established architecture for scalability. |
| **Database** | H2 Database (In-Memory) | Chosen for rapid prototyping and simplified setup during the hackathon time constraint. |
| **AI Integration** | [LLM Client Name - e.g., Gemini API] | Provides the core innovation: structured, reliable, and instantaneous classification via a sophisticated language model. |

---

## ⭐ Key Features Implemented

* **Intelligent Auto-Classification:** Queries are instantly categorized (`Complaint`, `Technical Issue`, etc.), assigned a `Priority` (`High`, `Medium`, `Low`), and analyzed for `Sentiment`.
* **Unified Dashboard:** A single-pane view for all queries, featuring filtering, sorting, and status tracking.
* **Agent Workflow:** Functionality to update query `Status` and assign queries to specific `Agents`.
* **Data Visualization:** Analytics panel with charts showing query distribution (Category and Priority).
* **Structured AI Output:** LLM prompt engineering ensures the AI returns a strict JSON object, maximizing reliability and minimizing parsing errors.

---

## 🧠 Technical Approach & Innovation

### 1. The Full-Stack Architecture

The application adheres to a clean, decoupled architecture:
1.  **React Frontend:** Handles user submission and renders all data via API calls.
2.  **Spring Boot Controller:** Receives the submission and delegates to the Service layer.
3.  **LlmClassificationService (Innovation Point):** This is the core logic. It sends the raw query to the LLM with a detailed System Prompt to enforce classification.
4.  **Repository/H2 DB:** Stores the classified, structured data before returning it to the frontend.

### 2. LLM Prompt Engineering for Reliability

To ensure high-quality data, we used a specific prompt structure. The LLM is instructed to ONLY return a JSON object, guaranteeing machine-readable output.

**Example LLM Directive:**
> "You are a professional support classifier. Analyze the user's query and strictly return a JSON object with keys: `category` (Complaint, Feature Request, Technical Issue, General Inquiry, Billing), `priority` (High, Medium, Low), `sentiment` (Positive, Neutral, Negative), and `keyPhrases` (list of 1-3 keywords)."

This prompt structure maximizes **Innovation** by leveraging the LLM's full capability for structured output.

---

## 💻 Setup & Run Instructions

### Prerequisites

* Java Development Kit (JDK 17+)
* Maven
* Node.js (LTS) & npm
* An LLM API Key (e.g., GEMINI_API_KEY or OPENAI_API_KEY)

### Backend Setup (Spring Boot)

1.  Navigate to the `backend/` directory.
2.  **Set API Key:** Create an `application.properties` file or set an environment variable:
    ```bash
    # Example for environment variable
    export LLM_API_KEY="your-llm-api-key-here"
    ```
3.  **Build and Run:**
    ```bash
    # Compile
    mvn clean install
    # Run the application
    mvn spring-boot:run
    ```
    The backend will start on `http://localhost:8080`.

### Frontend Setup (React)

1.  Navigate to the `frontend/` directory.
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Run Application:**
    ```bash
    npm start
    ```
    The React application will open on `http://localhost:3000`.

---

## 🚧 Challenges Faced & Key Decisions

1.  **Challenge:** Achieving consistent, structured output from the LLM. **Decision:** We used a comprehensive System Prompt, specifying the exact JSON schema and required values, resulting in near-perfect data integrity.
2.  **Challenge:** Combining the asynchronous LLM call with the synchronous Spring Boot database save operation. **Decision:** We implemented the LLM call within a dedicated service layer to keep the Controller clean, ensuring that the database transaction only occurs after the classification is successfully received.
