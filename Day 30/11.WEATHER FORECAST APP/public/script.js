const API = "http://localhost:3000";

function getWeather(){
    const cityName = city.value;
    fetch(`${API}/weather/${cityName}`)
    .then(res=>res.json())
    .then(data=>{
        if(data.main){
            result.innerHTML = `
                <h3>${data.name}, ${data.sys.country}</h3>
                <p>Temperature: ${data.main.temp} °C</p>
                <p>Weather: ${data.weather[0].description}</p>
                <p>Humidity: ${data.main.humidity}%</p>
                <p>Wind Speed: ${data.wind.speed} m/s</p>
            `;
        } else {
            result.innerHTML = `<p>City not found</p>`;
        }
    });
}