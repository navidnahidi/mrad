import R from 'rambda';

export const filterStations = R.pipe(
    R.map(station => R.omit(['rental_methods', 'rental_uris'], station)),
    R.map(station => ({
        externalId: station.external_id,
        stationId: station.station_id,
        legacyId: station.legacy_id,
        ...R.omit(['external_id', 'station_id', 'legacy_id'], station)
    })),
    R.filter(station => station.capacity < 12)
);

/**
 * @todo figure out if there is a preference for how we want to output the headers and
 * potentially values
 */
export const normalizeCSVHeaders = R.pipe(
    R.defaultTo([{}]),
    R.head,
    R.keys,
    R.map(
        key => ({ id: key, title: key })
    ),
);