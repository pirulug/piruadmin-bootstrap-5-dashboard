import { Calendar as BaseCalendar, plugins as allPlugins } from "fullcalendar/all";
import { Draggable } from "fullcalendar/interaction";
import classicTheme from "fullcalendar/themes/classic";
import "./fullcalendar.scss";

const plugins = [...allPlugins, classicTheme];

class Calendar extends BaseCalendar {
  constructor(el, optionOverrides = {}) {
    super(el, {
      ...optionOverrides,
      plugins: optionOverrides.plugins
        ? [classicTheme, ...optionOverrides.plugins]
        : plugins,
    });
  }
}

window.FullCalendar = {
  Calendar,
  plugins,
  classicTheme,
  Draggable,
};
