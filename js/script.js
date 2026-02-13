async function loadDemons() {
  const response = await fetch("top_75_demons.csv");
  const text = await response.text();

  const rows = text.split("\n").slice(1); // skip header
  const list = document.getElementById("demon-list");

  rows.forEach(row => {
    if (!row.trim()) return;

    const cols = row.split(",");
    const rank = cols[0];
    const name = cols[1];
    const difficulty = cols[2];
    const points = cols[3];

    const li = document.createElement("li");
    li.textContent = `${rank}. ${name} [${difficulty}] - ${points} pts`;

    list.appendChild(li);
  });
}

loadDemons();
