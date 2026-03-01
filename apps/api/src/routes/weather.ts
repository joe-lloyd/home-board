import { FastifyInstance } from "fastify";

export async function weatherRoutes(server: FastifyInstance) {
  server.get<{ Params: { city: string } }>(
    "/weather/:city",
    async (req, reply) => {
      const { city } = req.params;

      try {
        // Fetch simple JSON representation from wttr.in
        // format=j1 provides a structured JSON response
        const response = await fetch(
          `https://wttr.in/${encodeURIComponent(city)}?format=j1`,
        );

        if (!response.ok) {
          server.log.error(
            `Failed to fetch weather for ${city}: ${response.statusText}`,
          );
          return reply.code(502).send({ error: "Upstream Weather API Error" });
        }

        const data = await response.json();

        // Extract the relevant current condition data
        const current = data.current_condition?.[0];

        if (!current) {
          return reply
            .code(500)
            .send({ error: "Invalid weather data structure" });
        }

        const parsedWeather = {
          tempC: current.temp_C,
          condition: current.weatherDesc?.[0]?.value || "Unknown",
          iconPath: getWeatherIcon(current.weatherCode),
        };

        return parsedWeather;
      } catch (err) {
        server.log.error(`Weather fetch error: ${err}`);
        return reply
          .code(500)
          .send({ error: "Internal Server Error while fetching weather" });
      }
    },
  );
}

// Map wttr.in WMO codes to Lucide Icon names roughly
// Reference: https://github.com/chubin/wttr.in/blob/master/share/translations/en.txt
function getWeatherIcon(code: string): string {
  const c = parseInt(code, 10);
  switch (c) {
    case 113:
      return "Sun"; // Clear/Sunny
    case 116:
      return "CloudSun"; // Partly Cloudy
    case 119:
      return "Cloud"; // Cloudy
    case 122:
      return "Cloud"; // Overcast
    case 143:
      return "CloudFog"; // Mist
    case 176:
    case 263:
    case 266:
    case 293:
    case 296:
    case 299:
    case 302:
    case 305:
    case 308:
    case 353:
    case 356:
    case 359:
      return "CloudRain"; // Rain / Patchy Rain
    case 179:
    case 362:
    case 365:
    case 368:
    case 371:
      return "CloudSnow"; // Snow / Sleet
    case 200:
    case 386:
    case 389:
    case 392:
    case 395:
      return "CloudLightning"; // Thunder
    case 227:
    case 230:
    case 323:
    case 326:
    case 329:
    case 332:
    case 335:
    case 338:
      return "CloudSnow"; // Blizzard/Snow
    case 248:
    case 260:
      return "CloudFog"; // Fog
    case 311:
    case 314:
    case 317:
    case 320:
    case 350:
      return "CloudRain"; // Freezing Rain/Ice Pellets
    default:
      return "Cloud"; // Unknown
  }
}
