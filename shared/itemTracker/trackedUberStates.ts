import type {UberId} from "../types/UberStates"

const teleporterValueConverter = (value: number) => value & 0b1
const thresholdOf = (threshold: number) => (value: number) => value >= threshold ? 1 : 0

const trackedUberStates = [
  {uberId: {group: 0, state: 0}, trackingId: "tree_bash"},
  {uberId: {group: 0, state: 5}, trackingId: "tree_double_jump"},
  {uberId: {group: 0, state: 8}, trackingId: "tree_launch"},
  {uberId: {group: 0, state: 51}, trackingId: "tree_light_burst"},
  {uberId: {group: 0, state: 57}, trackingId: "tree_grapple"},
  {uberId: {group: 0, state: 62}, trackingId: "tree_flash"},
  {uberId: {group: 0, state: 77}, trackingId: "tree_regenerate"},
  {uberId: {group: 0, state: 97}, trackingId: "tree_bow"},
  {uberId: {group: 0, state: 100}, trackingId: "tree_sword"},
  {uberId: {group: 0, state: 101}, trackingId: "tree_burrow"},
  {uberId: {group: 0, state: 102}, trackingId: "tree_dash"},
  {uberId: {group: 0, state: 104}, trackingId: "tree_water_dash"},
  {uberId: {group: 0, state: 120}, trackingId: "tree_ancestral_light_glades"},
  {uberId: {group: 0, state: 121}, trackingId: "tree_ancestral_light_marsh"},

  {uberId: {group: 24922, state: 42531}, trackingId: "tp_midnight_burrows", valueConverter: teleporterValueConverter},
  {uberId: {group: 21786, state: 10185}, trackingId: "tp_inkwater_marsh", valueConverter: teleporterValueConverter},
  {uberId: {group: 11666, state: 61594}, trackingId: "tp_howls_den", valueConverter: teleporterValueConverter},
  {uberId: {group: 945, state: 58183}, trackingId: "tp_luma_pools_east", valueConverter: teleporterValueConverter},
  {uberId: {group: 945, state: 1370}, trackingId: "tp_luma_pools_west", valueConverter: teleporterValueConverter},
  {uberId: {group: 53632, state: 18181}, trackingId: "tp_wellspring", valueConverter: teleporterValueConverter},
  {uberId: {group: 28895, state: 54235}, trackingId: "tp_baurs_reach", valueConverter: teleporterValueConverter},
  {uberId: {group: 937, state: 26601}, trackingId: "tp_kwoloks_hollow", valueConverter: teleporterValueConverter},
  {uberId: {group: 18793, state: 38871}, trackingId: "tp_mouldwood_depths", valueConverter: teleporterValueConverter},
  {uberId: {group: 16155, state: 41465}, trackingId: "tp_willow_inner", valueConverter: teleporterValueConverter},
  {uberId: {group: 16155, state: 50867}, trackingId: "tp_willow_outer", valueConverter: teleporterValueConverter},
  {uberId: {group: 58674, state: 7071}, trackingId: "tp_silent_woods_west", valueConverter: teleporterValueConverter},
  {uberId: {group: 58674, state: 1965}, trackingId: "tp_silent_woods_wast", valueConverter: teleporterValueConverter},
  {
    uberId: {group: 58674, state: 10029},
    trackingId: "tp_windswept_wastes_west",
    valueConverter: teleporterValueConverter,
  },
  {
    uberId: {group: 20120, state: 49994},
    trackingId: "tp_windswept_wastes_east",
    valueConverter: teleporterValueConverter,
  },
  {
    uberId: {group: 20120, state: 41398},
    trackingId: "tp_windtorn_ruins_outer",
    valueConverter: teleporterValueConverter,
  },
  {
    uberId: {group: 10289, state: 4928},
    trackingId: "tp_windtorn_ruins_inner",
    valueConverter: teleporterValueConverter,
  },
  {uberId: {group: 42178, state: 42096}, trackingId: "tp_wellspring_glades", valueConverter: teleporterValueConverter},

  {uberId: {group: 24, state: 0}, trackingId: "skill_bash"},
  {uberId: {group: 24, state: 3}, trackingId: "skill_wall_jump"},
  {uberId: {group: 24, state: 5}, trackingId: "skill_double_jump"},
  {uberId: {group: 24, state: 8}, trackingId: "skill_launch"},
  {uberId: {group: 24, state: 14}, trackingId: "skill_glide"},
  {uberId: {group: 24, state: 23}, trackingId: "skill_water_breath"},
  {uberId: {group: 24, state: 51}, trackingId: "skill_light_burst"},
  {uberId: {group: 24, state: 57}, trackingId: "skill_grapple"},
  {uberId: {group: 24, state: 62}, trackingId: "skill_flash"},
  {uberId: {group: 24, state: 74}, trackingId: "skill_spike"},
  {uberId: {group: 24, state: 77}, trackingId: "skill_regenerate"},
  {uberId: {group: 24, state: 97}, trackingId: "skill_bow"},
  {uberId: {group: 24, state: 98}, trackingId: "skill_hammer"},
  {uberId: {group: 24, state: 99}, trackingId: "skill_torch"},
  {uberId: {group: 24, state: 100}, trackingId: "skill_sword"},
  {uberId: {group: 24, state: 101}, trackingId: "skill_burrow"},
  {uberId: {group: 24, state: 102}, trackingId: "skill_dash"},
  {uberId: {group: 24, state: 104}, trackingId: "skill_water_dash"},
  {uberId: {group: 24, state: 106}, trackingId: "skill_shuriken"},
  {uberId: {group: 24, state: 115}, trackingId: "skill_blaze"},
  {uberId: {group: 24, state: 116}, trackingId: "skill_sentry"},
  {uberId: {group: 24, state: 118}, trackingId: "skill_flap"},
  {uberId: {group: 24, state: 120}, trackingId: "skill_ancestral_light_glades"},
  {uberId: {group: 24, state: 121}, trackingId: "skill_ancestral_light_marsh"},
  {uberId: {group: 6, state: 2000}, trackingId: "skill_clean_water"},

  {uberId: {group: 4, state: 70}, trackingId: "melting_bow"},
  {uberId: {group: 4, state: 71}, trackingId: "melting_blaze"},
  {uberId: {group: 4, state: 72}, trackingId: "melting_sword"},
  {uberId: {group: 4, state: 73}, trackingId: "melting_hammer"},
  {uberId: {group: 4, state: 74}, trackingId: "melting_spike"},
  {uberId: {group: 4, state: 75}, trackingId: "melting_shuriken"},

  {uberId: {group: 5, state: 0}, trackingId: "resource_spirit_light"},
  {uberId: {group: 5, state: 1}, trackingId: "resource_gorlek_ore"},
  {uberId: {group: 14, state: 5}, trackingId: "resource_gorlek_ore_collected"},
  {uberId: {group: 5, state: 2}, trackingId: "resource_keystones"},

  {uberId: {group: 23, state: 1}, trackingId: "launch_fragments_count"},
  {uberId: {group: 23, state: 2}, trackingId: "launch_fragments_required"},
  {uberId: {group: 23, state: 100}, trackingId: "trees_count"},
  {uberId: {group: 23, state: 101}, trackingId: "trees_required"},
  {uberId: {group: 23, state: 102}, trackingId: "wisps_count"},
  {uberId: {group: 23, state: 103}, trackingId: "wisps_required"},
  {uberId: {group: 23, state: 104}, trackingId: "quests_count"},
  {uberId: {group: 23, state: 105}, trackingId: "quests_required"},
  {uberId: {group: 23, state: 106}, trackingId: "relics_count"},
  {uberId: {group: 23, state: 107}, trackingId: "relics_required"},
  {uberId: {group: 23, state: 500}, trackingId: "relic_current_area_uncollected"},

  {uberId: {group: 16155, state: 42976}, trackingId: "heart_wind_spinners"},
  {uberId: {group: 16155, state: 54940}, trackingId: "heart_spinning_lasers"},
  {uberId: {group: 16155, state: 24290}, trackingId: "heart_upper_heart"},
  {uberId: {group: 16155, state: 3588}, trackingId: "heart_burrow_heart"},
  {uberId: {group: 16155, state: 12971}, trackingId: "heart_willow_laser", valueConverter: thresholdOf(4)},
  {uberId: {group: 16155, state: 65277}, trackingId: "heart_redirect_puzzle"},
  {uberId: {group: 16155, state: 41488}, trackingId: "heart_boulder_escape"},
  {uberId: {group: 16155, state: 60752}, trackingId: "heart_lower_left"},

  {uberId: {group: 34543, state: 11226}, trackingId: "game_finished"},

  {uberId: {group: 14019, state: 44578}, trackingId: "quest_rebuild_glades"},

  {uberId: {group: 42178, state: 16825}, trackingId: "builder_project_spirit_well"},
  {uberId: {group: 42178, state: 51230}, trackingId: "builder_project_houses"},
  {uberId: {group: 42178, state: 18751}, trackingId: "builder_project_remove_thorns"},
  {uberId: {group: 42178, state: 23607}, trackingId: "builder_project_houses_b"},
  {uberId: {group: 42178, state: 40448}, trackingId: "builder_project_houses_c"},
  {uberId: {group: 42178, state: 16586}, trackingId: "builder_project_open_cave"},
  {uberId: {group: 42178, state: 15068}, trackingId: "builder_project_beautify"},

  // Maybe for later...
  {uberId: {group: 945, state: 49747}, trackingId: "wisp_pools"},
  {uberId: {group: 28895, state: 25522}, trackingId: "wisp_reach"},
  {uberId: {group: 18793, state: 63291}, trackingId: "wisp_depths"},
  {uberId: {group: 46462, state: 59806}, trackingId: "wisp_hollow"},
  {uberId: {group: 10289, state: 22102}, trackingId: "wisp_ruins"},
] as const

export type TrackedUberState = {
  uberId: UberId,
  trackingId: typeof trackedUberStates[number]["trackingId"],
  valueConverter?: (value: number) => number
}

export const TRACKED_UBER_STATES: readonly TrackedUberState[] = trackedUberStates
