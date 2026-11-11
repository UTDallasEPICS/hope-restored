# ADR [001]: [Improved Stocking Procedure]

- **Status:** [ Accepted ]
- **Deciders:** [@AryanVallabhbhai, @isaac-trejo, @Manu-Mahi, @JasonLaPorte]
- **Date:** 2026-09-24

---

## 1. Context & Problem Statement

Describe the issue or architectural challenge you are facing. Why does a decision need to be made right now? Keep it clear and concise.
>We need to improve the stocking procedure for our inventory management system to reduce errors and increase efficiency. The current process is manual and prone to mistakes, leading to discrepancies in stock levels.

---

## 2. Decision Drivers (Goals & Constraints)

List the main objectives, limitations, or requirements that influence this decision:

- **Goal 1:** Find a new stocking procedure that reduces errors for input new inventory items.
- **Goal 2:** Must be tecnically intuitive and easy to use for the staff.
- **Constraint:** Any hardware needed must be affordable and space efficent for the sponsor.

---

## 3. Options Considered

### Option 1: [Indvidual Barcode Scanning]

Short description of what this option entails.

- **Pros:**
  - Allows for each clothing item to be tracked individually, reducing errors in inventory counts.
  - Provides a clear audit trail for each item, making it easier to identify discrepancies.
- **Cons:**
  - Requires to print barcodes for each item, which may be time-consuming and require additional resources.
  -

### Option 2: QR Code Scanning]

Short description of what this option entails.

- **Pros:**
  - Advantage 1
  - Advantage 2
- **Cons:**
  - Disadvantage 1
  - Disadvantage 2

### Option 3: [Computer Vision Recognition]

Short description of what this option entails.

- **Pros:**
  - Advantage 1
  - Advantage 2
- **Cons:**
  - Disadvantage 1
  - Disadvantage 2

---

## 4. Decision & Justification

**Chosen Option:** Option [2] — [QR Code Scanning]

### Rationale

Explain why this option was selected over the others. Connect the decision back to the goals and constraints in Section 2.

> Example: We chose Option 2 because it meets our cost budget of under $5 while providing significantly better read/write speed than Option 1. Although Option 3 offered better long-term reliability, its high unit price makes it unfeasible for our production scale.

---

## 5. Consequences & Next Steps

### Positive Consequences

What becomes easier or better as a result of this decision?

### Negative Consequences / Trade-offs

What risks, tech debt, or overhead are we accepting?

### Action Items

- Task 1 (e.g., Update system design diagram)
- Task 2 (e.g., Order component sample for testing)
