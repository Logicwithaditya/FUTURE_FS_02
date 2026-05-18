
document.addEventListener("DOMContentLoaded", function () {
  
  function formatDate(date) {
    let d = new Date(date);
    let year = d.getFullYear();
    let month = String(d.getMonth() + 1).padStart(2, '0');
    let day = String(d.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;   
  }


  // Sidebar navigation toggle
  document.querySelectorAll(".sidebar li").forEach(item => {
    item.addEventListener("click", () => {
      // Sidebar active state
      document.querySelector(".sidebar .active").classList.remove("active");
      item.classList.add("active");

      // Hide all panels
      document.querySelectorAll(".panel").forEach(panel => {
        panel.classList.remove("active");
      });

      // Show selected panel
      const sectionId = item.getAttribute("data-section");
      document.getElementById(sectionId).classList.add("active");
    });
  });

  // Add Lead
  window.addLead = async function () {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const company = document.getElementById("company").value;
    const status = document.getElementById("status").value;
    const notes = document.getElementById("notes").value;
    const followUp = document.getElementById("followUp").value;

      // Send to backend
    const response = await fetch("http://localhost:3000/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, company, status, notes, followUp })
    });

    const result = await response.text();
    alert(result);

    // Refresh table
    loadLeads();
  };



  // Delete Lead
  window.deleteRow = async function (btn) {
    const row = btn.parentElement.parentElement;
    const leadId = row.getAttribute("data-id");

    if (!leadId) {
      row.remove(); // agar dummy row hai to sirf frontend se delete
      return;
    }

    const response = await fetch(`http://localhost:3000/api/leads/${leadId}`, {
      method: "DELETE"
    });

    const result = await response.text();
    alert(result);

    row.remove(); 
  };

  // Line Chart
  new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: {
      labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
      datasets: [{
        label: "Leads",
        data: [5,10,8,15,12,18,20],
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: { responsive: true, maintainAspectRatio: false}
  });

  // Pie Chart
  new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
      labels: ["Website","Referral","Social"],
      datasets: [{ data: [40,30,30], borderWidth: 1 }]
    },
    options: {responsive: true,maintainAspectRatio: false}
  });



  // Convert all existing <span class="status ..."> into editable dropdowns
  document.querySelectorAll("#leadTable .status").forEach(span => {
    const currentStatus = span.textContent.trim();
    const td = span.parentElement;

    // Create dropdown
    const select = document.createElement("select");
    select.className = "statusSelect";
    ["New", "In Progress", "Closed"].forEach(optionText => {
      const option = document.createElement("option");
      option.value = optionText;
      option.textContent = optionText;
      if (optionText === currentStatus) option.selected = true;
      select.appendChild(option);
    });

    // Replace span with dropdown
    td.replaceChild(select, span);

    // Add listener for styling
    select.addEventListener("change", function() {
      let statusClass = this.value === "New" ? "new" :
                        this.value === "Closed" ? "closed" : "progress";
      this.className = "statusSelect " + statusClass;

    });

    // Trigger initial styling
    select.dispatchEvent(new Event("change"));
  });
  
  async function loadLeads() {
    const response = await fetch("http://localhost:3000/api/leads");
    const leads = await response.json();

    const tableBody = document.getElementById("leadTable");
    tableBody.innerHTML = ""; // clear dummy rows

    leads.forEach(lead => {
      const row = tableBody.insertRow();
      row.innerHTML = `
        <td>${lead.name}</td>
        <td>${lead.email}</td>
        <td>${lead.phone}</td>
        <td>${lead.company}</td>
        <td><select class="statusSelect">
          <option value="New" ${lead.status === "New" ? "selected" : ""}>New</option>
          <option value="In Progress" ${lead.status === "In Progress" ? "selected" : ""}>In Progress</option>
          <option value="Closed" ${lead.status === "Closed" ? "selected" : ""}>Closed</option>
          </select>
        </td>
        <td>${lead.notes || ""}</td>
        <td>${lead.follow_up || ""}</td>
        <td><button onclick="deleteRow(this)">Delete</button></td>
      `;

      // ✅ Yahan row ke andar database ka id set karo
      row.setAttribute("data-id", lead.id);
    
      // status styling
      const select = row.querySelector(".statusSelect");
      select.addEventListener("change", async function () {
        let statusClass = this.value === "New" ? "new" :
                          this.value === "Closed" ? "closed" : "progress";
        this.className = "statusSelect " + statusClass;

        // ✅ Update backend when status changes
        await fetch(`http://localhost:3000/api/leads/${lead.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: this.value,
            notes: row.cells[5].textContent,
            followUp: row.cells[6].textContent
          })
        });
      });  
      select.dispatchEvent(new Event("change")); 
    });
    
  };
  
  // ✅ Call loadLeads once on page load
  loadLeads();
});

