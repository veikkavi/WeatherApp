using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WeatherApp.Data;
using WeatherApp.Models;

namespace WeatherApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WeatherController : ControllerBase
    {
        private readonly WeatherAppContext _context;
        private readonly DataSeeding _seeding;

        public WeatherController(WeatherAppContext context)
        {
            _context = context;
            _seeding = new DataSeeding(context);
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<Weather>> GetWeather(int id)
        {
            var weather = await _context.Weather.FindAsync(id);

            if (weather == null)
            {
                return NotFound();
            }

            return weather;
        }

        [HttpGet("filtered")]
        public async Task<ActionResult<IEnumerable<Weather>>> Get(string startDate, string endDate, int cityId, string sortColumn = "date", string sortOrder = "asc", int pageNumber = 0, int pageSize = 10)
        {
            // Try to parse dates
            DateTime startDateTime;
            DateTime endDateTime;
            try
            {
                startDateTime = DateTime.Parse(startDate);
                endDateTime = DateTime.Parse(endDate);
            }
            catch
            {
                return BadRequest();
            }

            // Get weather data
            var weatherRows = from s in _context.Weather where s.Date >= startDateTime && s.Date <= endDateTime && s.CityId == cityId select s;

            // Sort by active column
            switch ($"{sortColumn}_{sortOrder}")
            {
                case "date_asc":
                    weatherRows = weatherRows.OrderBy(x => x.Date);
                    break;
                case "date_desc":
                    weatherRows = weatherRows.OrderByDescending(x => x.Date);
                    break;
                case "temperature_asc":
                    weatherRows = weatherRows.OrderBy(x => x.Temperature);
                    break;
                case "temperature_desc":
                    weatherRows = weatherRows.OrderByDescending(x => x.Temperature);
                    break;
                case "rain_asc":
                    weatherRows = weatherRows.OrderBy(x => x.Rain);
                    break;
                case "rain_desc":
                    weatherRows = weatherRows.OrderByDescending(x => x.Rain);
                    break;
                case "wind_asc":
                    weatherRows = weatherRows.OrderBy(x => x.Wind);
                    break;
                case "wind_desc":
                    weatherRows = weatherRows.OrderByDescending(x => x.Wind);
                    break;
            }

            // Return only current page
            return CreatedAtAction("filtered", weatherRows.Skip(pageNumber * pageSize).Take(pageSize));      
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Weather>>> Get(string startDate, string endDate, int cityId)
        {
            // Try to parse dates
            DateTime startDateTime;
            DateTime endDateTime;
            try
            {
                startDateTime = DateTime.Parse(startDate);
                endDateTime = DateTime.Parse(endDate);
            }
            catch
            {
                return BadRequest();
            }

            // Return weather data
            var weatherRows = from s in _context.Weather where s.Date >= startDateTime && s.Date <= endDateTime && s.CityId == cityId select s;
            return CreatedAtAction("filtered", await weatherRows.ToListAsync());
        }

        [HttpGet("count")]
        public async Task<ActionResult<int>> GetCount(string startDate, string endDate, int cityId)
        {
            // Try to parse dates
            DateTime startDateTime;
            DateTime endDateTime;
            try
            {
                startDateTime = DateTime.Parse(startDate);
                endDateTime = DateTime.Parse(endDate);
            }
            catch
            {
                return BadRequest();
            }

            var weatherRows = from s in _context.Weather where s.Date >= startDateTime && s.Date <= endDateTime && s.CityId == cityId select s;
            return await weatherRows.CountAsync();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutWeather(int id, Weather weather)
        {
            if (id != weather.Id)
            {
                return BadRequest();
            }

            _context.Entry(weather).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!WeatherExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpPost]
        public async Task<ActionResult<Weather>> PostWeather(Weather weather)
        {
            _context.Weather.Add(weather);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetWeather", new { id = weather.Id }, weather);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWeather(int id)
        {
            var weather = await _context.Weather.FindAsync(id);
            if (weather == null)
            {
                return NotFound();
            }

            _context.Weather.Remove(weather);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("Seed")]
        public async Task<ActionResult<int>> Seed(string startDate, string endDate, int cityId)
        {
            // Try to parse dates
            DateTime startDateTime;
            DateTime endDateTime;
            try
            {
                startDateTime = DateTime.Parse(startDate);
                endDateTime = DateTime.Parse(endDate);
            }
            catch
            {
                return BadRequest();
            }

            // Try to get city
            City city = await _context.City.FirstOrDefaultAsync(c => c.Id == cityId);
            if (city == null)
            {
                return NotFound("City not found");
            }

            return await _seeding.SeedWeatherData(startDateTime, endDateTime, city);
        }

        private bool WeatherExists(int id)
        {
            return _context.Weather.Any(e => e.Id == id);
        }
    }
}
