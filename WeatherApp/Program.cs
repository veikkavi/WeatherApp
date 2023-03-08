using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WeatherApp.Data;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<WeatherAppContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("WeatherAppContext") ?? throw new InvalidOperationException("Connection string 'WeatherAppContext' not found.")));

// Add services to the container.

builder.Services.AddControllersWithViews();

var app = builder.Build();

// Initialize database 
using (var scope = app.Services.CreateScope())
{
    WeatherAppContext context = new(scope.ServiceProvider.GetRequiredService<DbContextOptions<WeatherAppContext>>());
    DataSeeding seeding = new(context);

    seeding.InitializeDatabase();
}

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
}

app.UseStaticFiles();
app.UseRouting();


app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html"); ;

app.Run();
