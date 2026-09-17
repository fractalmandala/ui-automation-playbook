// The generated stylesheet is the app's only design-system import: tokens plus
// one Sass block per component, exactly as the pipeline emitted it.
import '$generated/styles/index.sass';
import './app.sass';

import { mount } from 'svelte';
import App from './App.svelte';

mount(App, { target: document.getElementById('app')! });
