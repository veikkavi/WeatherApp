

namespace WeatherApp.Models
{
    public class Weather 
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public decimal Temperature { get; set; }
        public decimal Rain { get; set; }
        public decimal Wind { get; set; }
        public int CityId { get; set; }
        public City City { get; set; }
    }

    public class City
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public List<Weather> Weathers { get; set; }
    }
    
}