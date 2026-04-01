# Salesforce Account Schematic Engine

A dynamic multi-level filtering engine built on Salesforce to manage complex relationships across Accounts, Deposits, Treasury Services, Products and Status.

---

## 🔍 Overview

Enterprise Salesforce implementations (especially banking systems like nCino) involve deeply connected data models.
Managing and filtering this data across multiple levels is complex and inefficient with standard UI.

This project solves that by building a **dynamic filtering engine** with real-time UI synchronization and scalable backend logic.

---

## 🧠 Key Concept

This system is not just UI filtering.

It is a **multi-layer relationship engine**:

Account → Deposit → Treasury Service → Product → Status

Each selection dynamically impacts all other layers.

---

## ⚙️ Problem Statement

* Complex relationships across multiple objects
* Manual filtering across layers is inefficient
* UI inconsistency when filters overlap
* Data dependency across objects

---

## 🚀 Solution

Built a **dynamic filtering engine** using:

* Apex (dynamic SOQL queries)
* Aura Components (UI layer)
* JavaScript Helper (state + filtering logic)

---

## 🧩 Core Features

* Multi-level dynamic filtering
* Real-time UI updates
* Cross-filter synchronization
* Duplicate + selected state handling
* Bulk-safe backend processing

---

## 🧠 Filtering Logic (Core Innovation)

The system uses a **3-layer selection model**:

Selected IDs

* Duplicate Selected IDs
* All IDs (fallback)

---

Final Filter Set

### Why this matters:

* Prevents data loss
* Maintains UI consistency
* Supports complex filter combinations

---

## 🔄 System Flow (Architecture)

User Selection (UI)
↓
Aura Controller
↓
Helper JS (State Logic)
↓
Apex Controller
↓
Dynamic SOQL
↓
Filtered Data
↓
UI Refresh

---

## 🧱 Architecture Diagram

```
                +----------------------+
                |   Aura Component     |
                |  (UI + Filters)      |
                +----------+-----------+
                           |
                           ↓
                +----------------------+
                | Controller.js        |
                +----------+-----------+
                           |
                           ↓
                +----------------------+
                | Helper.js            |
                | (Filtering Engine)   |
                +----------+-----------+
                           |
                           ↓
                +----------------------+
                | Apex Controller      |
                +----------+-----------+
                           |
                           ↓
                +----------------------+
                | SOQL Queries         |
                +----------+-----------+
                           |
                           ↓
                +----------------------+
                | Salesforce Objects   |
                | Account → Deposit →  |
                | Treasury → Product   |
                +----------------------+
```

---

## 🔧 Tech Stack

* Apex (Backend logic)
* Aura Components (UI layer)
* JavaScript (Helper logic)
* SOQL (Dynamic queries)
* Salesforce Data Model

---

## 📂 Project Structure

force-app/main/default/
│
├── classes/
│   └── AccountSchematicController.cls
│
├── aura/
│   └── AccountSchematic/
│       ├── AccountSchematic.cmp
│       ├── AccountSchematicController.js
│       ├── AccountSchematicHelper.js
│       └── AccountSchematic.css

---

## 📈 Impact

* Reduced manual navigation effort
* Improved data visibility across relationships
* Enabled scalable enterprise filtering
* Supports banking-style data models (nCino-inspired)

---

## 🧠 Engineering Highlights

* Dynamic SOQL query building
* Multi-layer state management
* Separation of concerns (UI / Logic / Data)
* Bulk-safe design
* Real-time filtering engine

---

## 🔗 Domain Context

Inspired by:

* nCino account-product relationships
* Enterprise banking workflows
* CRM data modeling patterns

---

## 🚀 Future Enhancements

* Convert Aura → LWC
* Add caching layer for performance
* Introduce pagination for large datasets
* Add graph-based visualization

---

## 👨‍💻 Author

Abilash — Salesforce Backend Developer (nCino-focused)
