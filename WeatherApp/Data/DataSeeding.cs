using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System.IO;
using System.Text;
using WeatherApp.Models;

namespace WeatherApp.Data
{
    public class DataSeeding
    {

        private readonly WeatherAppContext _context;
        public DataSeeding(WeatherAppContext context)
        {
            _context = context;
        }   

        /// <summary>
        /// Ensures that database is created and populates default cities
        /// </summary>
        public void InitializeDatabase()
        {
            // Create database and tables if not existing
            _context.Database.EnsureDeleted();
            if (_context.Database.EnsureCreated())
            {
                // Populate cities when database is first created
                _context.City.AddRange(DefaultCities);
                _context.SaveChanges();

            }
        }

        /// <summary>
        /// Empties weather table and generates random weather data for given date range and city
        /// </summary>
        /// <param name="startDate"></param>
        /// <param name="endDate"></param>
        /// <param name="city"></param>
        public async Task<int> SeedWeatherData(DateTime startDate, DateTime endDate, City city)
        {
            // Create first random weather
            Weather previousWeather = new Weather
            {
                Temperature = Random.Shared.Next(-30, 30),
                Wind = Random.Shared.Next(0, 20),
                Rain = Random.Shared.Next(0, 20)
            };

            for (DateTime date = startDate; date <= endDate; date = date.AddDays(1))
            {
                Weather randomWeather = GetRandomWeather(date, previousWeather, city);

                // If there is already row for this date and city, update it.
                Weather? existingWeather = _context.Weather.FirstOrDefault(w => w.City == city && w.Date.Equals(randomWeather.Date));
                if (existingWeather != null)
                {
                    existingWeather.Temperature = randomWeather.Temperature;
                    existingWeather.Rain = randomWeather.Rain;
                    existingWeather.Wind = randomWeather.Wind;
                    _context.Weather.Update(existingWeather);
                }
                // If not, add new row
                else
                {
                    await _context.Weather.AddAsync(randomWeather);
                }

                previousWeather = randomWeather;
            }

            return await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Returns random weather for given date and city.
        /// Uses defined ranges of current month and values of previous day to generate weather
        /// </summary>
        /// <param name="date"></param>
        /// <param name="previousWeather"></param>
        /// <param name="city"></param>
        /// <returns></returns>
        private Weather GetRandomWeather(DateTime date, Weather previousWeather, City city)
        {
            Weather weather = new Weather
            {
                Date = date,
                City = city
            };

            (int Start, int End) temperatureRange = WeatherRanges.First(x => x.Month == date.Month).TemperatureRange;
            (int Start, int End) windRange = WeatherRanges.First(x => x.Month == date.Month).WindRange;
            (int Start, int End) rainRange = WeatherRanges.First(x => x.Month == date.Month).RainRange;

            weather.Temperature = previousWeather.Temperature + (decimal)Random.Shared.Next(-500, 500) / 100;
            if (weather.Temperature > temperatureRange.End)
            {
                weather.Temperature = temperatureRange.End;
            }
            else if (weather.Temperature < temperatureRange.Start)
            {
                weather.Temperature = temperatureRange.Start;
            }

            weather.Wind = previousWeather.Wind + (decimal)Random.Shared.Next(-500, 500) / 100;
            if (weather.Wind > windRange.End)
            {
                weather.Wind = windRange.End;
            }
            else if (weather.Wind < windRange.Start)
            {
                weather.Wind = windRange.Start;
            }

            weather.Rain = previousWeather.Rain + (decimal)Random.Shared.Next(-500, 500) / 100;
            if (weather.Rain > rainRange.End)
            {
                weather.Rain = rainRange.End;
            }
            else if (weather.Rain < rainRange.Start)
            {
                weather.Rain = rainRange.Start;
            }

            return weather;

        }

        private static City[] DefaultCities = new City[]{
            new City{ Name = "Oulu"},
            new City{ Name = "Helsinki"},
            new City{ Name = "Rovaniemi"},
            new City{ Name = "Jyväskylä"},
            new City{ Name = "Tampere"},
        };

        private class WeatherRange
        {
            public int Month;
            public (int Start, int End) TemperatureRange;
            public (int Start, int End) WindRange;
            public (int Start, int End) RainRange;
        }

        /// <summary>
        /// Weather ranges for seeding of random data
        /// </summary>
        private static WeatherRange[] WeatherRanges = new WeatherRange[]{
            new WeatherRange {
                Month = 1,
                TemperatureRange = (-30, 0),
                WindRange = (0, 10),
                RainRange = (0, 50)
            },
            new WeatherRange {
                Month = 2,
                TemperatureRange = (-25, 5),
                WindRange = (0, 10),
                RainRange = (5, 50)
            },
            new WeatherRange {
                Month = 3,
                TemperatureRange = (-20, 5),
                WindRange = (0, 10),
                RainRange = (5, 50),
                },
            new WeatherRange {
                Month = 4,
                TemperatureRange = (-10, 15),
                WindRange = (0, 10),
                RainRange = (10, 50),
                },
            new WeatherRange {
                Month = 5,
                TemperatureRange = (0, 25),
                WindRange = (0, 10),
                RainRange = (20, 60),
                },
            new WeatherRange {
                Month = 6,
                TemperatureRange = (5, 30),
                WindRange = (0, 10),
                RainRange = (30, 80),
                },
            new WeatherRange {
                Month = 7,
                TemperatureRange = (10, 30),
                WindRange = (0, 10),
                RainRange = (40, 100),
                },
            new WeatherRange {
                Month = 8,
                TemperatureRange = (10, 30),
                WindRange = (0, 10),
                RainRange = (40, 90),
                },
            new WeatherRange {
                Month = 9,
                TemperatureRange = (0, 15),
                WindRange = (0, 10),
                RainRange = (30, 80),
                },
            new WeatherRange {
                Month = 10,
                TemperatureRange = (-10, 10),
                WindRange = (0, 10),
                RainRange = (20, 75),
                },
            new WeatherRange {
                Month = 11,
                TemperatureRange = (-20, 5),
                WindRange = (0, 10),
                RainRange = (15, 70),
                },
            new WeatherRange {
                Month = 12,
                TemperatureRange = (-25, 5),
                WindRange = (0, 10),
                RainRange = (10, 60),
                },
        };
    }
}
