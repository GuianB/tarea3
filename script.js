document.addEventListener('DOMContentLoaded', function() {
  const indicatorSelect = document.getElementById('indicatorSelect');
  const indicatorInfo = document.getElementById('indicatorInfo');
  const indicatorChart = document.getElementById('indicatorChart').getContext('2d');
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  const indicatorTable = document.getElementById('indicatorTable');
  let chart;

  // Obtener los tipos de indicadores disponibles
  axios.get('https://mindicador.cl/api')
    .then(function(response) {
      const indicators = response.data;
      for (const key in indicators) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = indicators[key].nombre;
        indicatorSelect.appendChild(option);
      }
    })
    .catch(function(error) {
      console.log(error);
    });

  // Obtener la información del indicador seleccionado
  function getIndicatorData(selectedIndicator, startDate, endDate) {
    axios.get(`https://mindicador.cl/api/${selectedIndicator}`)
      .then(function(response) {
        const indicatorData = response.data;
        let html = '';
        html += `<h3>${indicatorData.nombre}</h3>`;
        html += `<p>Valor: ${indicatorData.serie[0].valor}</p>`;
        html += `<p>Unidad de medida: ${indicatorData.unidad_medida}</p>`;
        indicatorInfo.innerHTML = html;

        const filteredData = indicatorData.serie.filter(function(data) {
          const date = new Date(data.fecha);
          date.setHours(0, 0, 0, 0); // Establecer hora a cero
          return date >= startDate && date <= endDate;
        });

        const startDateYear = startDate.getFullYear();
        const endDateYear = endDate.getFullYear();
        const years = [];
        for (let year = startDateYear; year <= endDateYear; year++) {
          years.push(year.toString());
        }

        const values = [];
        for (const year of years) {
          const data = filteredData.find(function(d) {
            const date = new Date(d.fecha);
            date.setHours(0, 0, 0, 0); // Establecer hora a cero
            return date.getFullYear().toString() === year;
          });
          if (data) {
            values.push(data.valor);
          } else {
            values.push(null);
          }
        }

        if (chart) {
          chart.destroy();
        }

        chart = new Chart(indicatorChart, {
          type: 'line',
          data: {
            labels: years,
            datasets: [{
              label: indicatorData.nombre,
              data: values,
              backgroundColor: 'rgba(0, 123, 255, 0.3)',
              borderColor: 'rgba(0, 123, 255, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                display: true
              }
            }
          }
        });

        // Actualizar la tabla con los datos seleccionados
        indicatorTable.innerHTML = '';

        const tableHeader = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headerCell1 = document.createElement('th');
        headerCell1.textContent = 'Fecha';
        const headerCell2 = document.createElement('th');
        headerCell2.textContent = 'Valor';

        headerRow.appendChild(headerCell1);
        headerRow.appendChild(headerCell2);
        tableHeader.appendChild(headerRow);
        indicatorTable.appendChild(tableHeader);

        const tableBody = document.createElement('tbody');
        for (let i = 0; i < filteredData.length; i++) {
          const dataRow = document.createElement('tr');
          const dataCell1 = document.createElement('td');
          dataCell1.textContent = filteredData[i].fecha;
          const dataCell2 = document.createElement('td');
          dataCell2.textContent = filteredData[i].valor;

          dataRow.appendChild(dataCell1);
          dataRow.appendChild(dataCell2);
          tableBody.appendChild(dataRow);
        }

        indicatorTable.appendChild(tableBody);
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  // Manejar el evento de cambio de selección del indicador
  indicatorSelect.addEventListener('change', function() {
    const selectedIndicator = indicatorSelect.value;
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    getIndicatorData(selectedIndicator, startDate, endDate);
  });

  // Manejar el evento de cambio de fecha de inicio
  startDateInput.addEventListener('change', function() {
    const selectedIndicator = indicatorSelect.value;
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    getIndicatorData(selectedIndicator, startDate, endDate);
  });

  // Manejar el evento de cambio de fecha de fin
  endDateInput.addEventListener('change', function() {
    const selectedIndicator = indicatorSelect.value;
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    getIndicatorData(selectedIndicator, startDate, endDate);
  });
});