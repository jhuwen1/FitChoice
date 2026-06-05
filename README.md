<p align="center">
  <img src="assets/images/logo.png" width="450" alt="FitChoice Logo" />
</p>



# Fit<span style="color: #FF6B35;">Choice</span>

A gamified health and fitness application that transforms macro tracking and habit building into an engaging, immersive journey. Built using a modern multi-platform stack, **FitChoice** blends 3D visualization, interactive leveling systems, and precision nutritional tracking to motivate users to achieve their physical wellness goals.

---

## 📌 Project Overview
Many fitness applications fail because tracking food and workouts feels like a chore. **FitChoice** solves this by turning personal fitness into an interactive experience. By blending gamified progression (levels, trophies, experience points) with an interactive 3D body visualization, users get a highly visual, real-time representation of their progress, making consistency rewarding and engaging.

---

## Core Functionalities

* **Gamified Fitness Progression:** Earn XP, level up, and unlock achievements/trophies by hitting daily step counts, completing workouts, and logging meals.
* **3D Body Visualization:** An interactive, adaptive 3D model that provides visual feedback based on user metrics and ongoing fitness journeys.
* **Precision Macronutrient Tracking:** Log daily meals with an intuitive breakdown of Carbs, Proteins, and Fats, mapped directly against personalized caloric targets.
* **Activity & Step Monitoring:** Restored and fully functional step/walk tracking that feeds directly into the gamification engine to award daily rewards.
* **Cozy & Vibrant UI/UX:** A clean, fluid, and highly polished visual aesthetic designed to maximize user retention and minimize entry friction.

---

## Tech Stack & Architectural Decisions

A primary architectural choice in **FitChoice** was moving beyond traditional single-language limitations (like using purely native Java or standard Python scripts) to build a multi-platform experience using **React Native / JavaScript** alongside compiled environments. 

Here is why this stack was chosen and how it retains core software engineering paradigms:

### 1. Why Not Pure Python or Java?
* **Java (Native Android):** While exceptional for high-performance Android builds, writing pure Java restricts the application to a single ecosystem, requiring a complete rewrite in Swift for iOS deployment. 
* **Python:** Excellent for rapid prototyping and data science, but natively lacks the optimization, fluid rendering engines, and cross-platform UI ecosystem required for responsive, modern mobile apps.
* **The FitChoice Solution:** By utilizing a robust multi-platform framework (React Native), the codebase maintains a single, highly performant foundation that compiles natively for both iOS and Android, allowing flawless integration of UI components and 3D rendering.

### 2. How the OOP Principles of Java & Python Live On
Even though the interface and logic flow are written in JavaScript/TypeScript, the structural integrity relies entirely on **Object-Oriented Programming (OOP)** paradigms foundational to Java and Python:

* **Encapsulation:** User profiles, macro calculations, and 3D model states are managed as isolated classes and state-driven objects. Internal metrics (like precise formulas for BMR) are encapsulated, exposing only necessary setter and getter functions to the interface.
* **Inheritance & Reusability:** Custom UI components, workout structures, and gamified reward systems inherit properties from core base classes, preventing code duplication and matching Java’s strict class hierarchies.
* **Polymorphism:** Achievement trackers and tracking modules use polymorphic interfaces. For example, a single `.track()` method behaves differently whether it is evaluating a physical walking activity or a nutritional caloric entry.

---

## How It Works

```
[ User Input ] ---> [ Logic Layer (OOP State) ] ---> [ Gamification ]
       |                                                    |
       v                                                    v
[ Macro / Step Logs ]                                [ XP / 3D Visual Update ]
```

1.  **Initialization:** The app sets up a unique user profile object containing basal metrics, current fitness levels, and milestone tracking.
2.  **Data Ingestion:** As you log steps or input food items, the data handler processes the inputs through encapsulated verification methods.
3.  **The Gamified Loop:** The transaction triggers the gamification logic. If an activity meets a daily goal, an abstract reward factory instantiates a trophy or updates the user's XP attribute.
4.  **Visual Render:** The updated states are piped directly to the UI layer, triggering fluid transitions in your leveling indicators and adapting the 3D body visualization layout.

---

## 📥 Installation & Setup

## Scan to Download / View Project
To run or preview the application immediately, scan the QR code below:

<p align="left">
  <img src="assets/images/Screenshot 2026-06-05 125831.png" width="600" alt="FitChoice App QR Code" />
</p>

## Download via link
https://expo.dev/accounts/jhuwens-organization/projects/fitchoice/builds/1fac1822-f4d8-46aa-844f-28c9d59a788f


## Instruction to open the app via local machine/vscode
Follow these steps to run **FitChoice** locally in your development environment:

### Prerequisites
* Ensure you have **Node.js** (v18+) installed.
* For Android testing: **Android Studio** and an active Emulator.
* For iOS testing (macOS only): **Xcode** and CocoaPods.

### Step-by-Step Deployment

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/fitchoice.git
    cd fitchoice
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```
    *If using iOS, navigate to the ios folder and install pods:*
    ```bash
    cd ios && pod install && cd ..
    ```

3.  **Start the Metro Bundler:**
    ```bash
    npm start
    ```

4.  **Launch the Application:**
    * **For Android:** Press `a` in the terminal or run:
        ```bash
        npm run android
        ```
    * **For iOS:** Press `i` in the terminal or run:
        ```bash
        npm run ios
        ```

---

## Development Team
Proudly engineered and developed by:
* **Jhuwen Justin Asido Carloto**
* **Miguel Jiro Cerdena**
* **Timothy James Canayon**
* **Aidan Alexander Aganon**
* **Lesther Arevalo**

---
*FitChoice — Elevate your fitness, one level at a time.*
