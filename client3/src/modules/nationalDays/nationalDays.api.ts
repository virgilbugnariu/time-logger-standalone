import dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween';
import { getFromStorage, setToStorage } from "../common/utils";
import { getDateFrom } from "../pages/calendar/utils";
import nationalDaysSlice from "./nationalDays.slice";
import type { NationalDay, NationalDayDTO, NationalDayMap } from "./types";
import { decompose } from "./utils";

const MOCK_DATA = [{ "date": "2023-01-01", "localName": "Anul Nou", "name": "New Year's Day", "countryCode": "RO", "fixed": true, "global": true, "counties": null, "launchYear": null, "type": "Public" }, { "date": "2023-01-02", "localName": "Anul Nou", "name": "Day after New Year's Day", "countryCode": "RO", "fixed": true, "global": true, "counties": null, "launchYear": null, "type": "Public" }, { "date": "2023-01-24", "localName": "Unirea Principatelor Române/Mica Unire", "name": "Union Day/Small Union", "countryCode": "RO", "fixed": true, "global": true, "counties": null, "launchYear": null, "type": "Public" }, { "date": "2023-04-14", "localName": "Vinerea mare", "name": "Good Friday", "countryCode": "RO", "fixed": false, "global": true, "counties": null, "launchYear": 2018, "type": "Public" }, { "date": "2023-04-16", "localName": "Paștele", "name": "Easter Sunday", "countryCode": "RO", "fixed": false, "global": true, "counties": null, "launchYear": null, "type": "Public" }, { "date": "2023-04-17", "localName": "Paștele", "name": "Easter Monday", "countryCode": "RO", "fixed": false, "global": true, "counties": null, "launchYear": null, "type": "Public" }, { "date": "2023-05-01", "localName": "Ziua Muncii", "name": "Labour Day", "countryCode": "RO", "fixed": true, "global": true, "counties": null, "launchYear": null, "type": "Public" }, { "date": "2023-06-01", "localName": "Ziua Copilului", "name": "Children's Day", "countryCode": "RO", "fixed": true, "global": true, "counties": null, "launchYear": 2017, "type": "Public" }, { "date": "2023-06-04", "localName": "Rusaliile", "name": "Pentecost", "countryCode": "RO", "fixed": false, "global": true, "counties": null, "launchYear": null, "type": "Public" }, { "date": "2023-06-05", "localName": "Rusaliile", "name": "Whit Monday", "countryCode": "RO", "fixed": false, "global": true, "counties": null, "launchYear": null, "type": "Public" }, { "date": "2023-08-15", "localName": "Adormirea Maicii Domnului/Sfânta Maria Mare", "name": "Dormition of the Theotokos", "countryCode": "RO", "fixed": true, "global": true, "counties": null, "launchYear": null, "type": "Public" }, { "date": "2023-11-30", "localName": "Sfântul Andrei", "name": "St. Andrew's Day", "countryCode": "RO", "fixed": true, "global": true, "counties": null, "launchYear": null, "type": "Public" }, { "date": "2023-12-01", "localName": "Ziua Națională/Marea Unire", "name": "National Day/Great Union", "countryCode": "RO", "fixed": true, "global": true, "counties": null, "launchYear": null, "type": "Public" }, { "date": "2023-12-25", "localName": "Crăciunul", "name": "Christmas Day", "countryCode": "RO", "fixed": true, "global": true, "counties": null, "launchYear": null, "type": "Public" }, { "date": "2023-12-26", "localName": "Crăciunul", "name": "St. Stephen's Day", "countryCode": "RO", "fixed": true, "global": true, "counties": null, "launchYear": null, "type": "Public" }];

const CURRENT_YEAR = dayjs().year();

type CachedNationalDays = Record<number | string, {
  timestamp: number;
  data?: NationalDayDTO[];
}>;

dayjs.extend(isBetween)

async function getNationalDays(year: number = CURRENT_YEAR): Promise<NationalDayDTO[]> {
  const cache = getFromStorage<CachedNationalDays>('nationalDays');
  if (cache && cache && cache[year]) {
    const isBetween = dayjs(cache[year].timestamp).isBetween(dayjs().subtract(1, 'week'), dayjs());
    if (isBetween) {
      return cache[year].data || null;
    }
  }

  try {
    const response = await fetch(`https://date.nager.at/api/v2/PublicHolidays/${year}/RO`, {
      headers: {
        'Content-Type': 'application/json'
      },
    })

    const data = await response.json() as NationalDayDTO[];

    setToStorage('nationalDays', {
      ...cache,
      [year]: {
        timestamp: Date.now(),
        data,
      },
    } as CachedNationalDays);

    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function loadNationalDays(year: number = CURRENT_YEAR): Promise<NationalDay[]> {
  const daysDTO = await getNationalDays(year);
  const nationalDays = (daysDTO || []).map((dto) => {
    const { year, month, day } = decompose(dto.date);
    const date = getDateFrom(day, month, year);
    return {
      year,
      day,
      month,
      name: dto.localName,
      formattedDate: date.format("DD-MMM-YYYY"),
      isDuringTheWeekend: date.day() === 6 || date.day() === 0,
      weekDay: date.format("dddd"),
    } as NationalDay;
  });

  nationalDays.forEach(nationalDaysSlice.actions.add);

  return nationalDays;
}
