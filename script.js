document.addEventListener('DOMContentLoaded', function() {
    const indicatorSelect = document.getElementById('indicatorSelect');
    const indicatorInfo = document.getElementById('indicatorInfo');
    const indicatorChart = document.getElementById('indicatorChart').getContext('2d');
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
    indicatorSelect.addEventListener('change', function() {
      const selectedIndicator = indicatorSelect.value;
      axios.get(`https://mindicador.cl/api/${selectedIndicator}`)
        .then(function(response) {
          const indicatorData = response.data;
          let html = '';
          html += `<h3>${indicatorData.nombre}</h3>`;
          html += `<p>Valor: ${indicatorData.serie[0].valor}</p>`;
          html += `<p>Unidad de medida: ${indicatorData.unidad_medida}</p>`;
          indicatorInfo.innerHTML = html;
  
          const dates = [];
          const values = [];
          for (const data of indicatorData.serie) {
            dates.push(data.fecha);
            values.push(data.valor);
          }
  
          if (chart) {
            chart.destroy();
          }
  
          chart = new Chart(indicatorChart, {
            type: 'line',
            data: {
              labels: dates,
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
                  display: false
                }
              }
            }
          });
        })
        .catch(function(error) {
          console.log(error);
        });
    });
  });
  