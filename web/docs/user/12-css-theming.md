---
layout: layouts/docs.tsx
title: CSS Theming
---
## CSS Theming

You can create your own custom theme for Treehouse using our built-in variables a.k.a. custom properties.

### Create a theme
1. Add a top level folder called "ext" to your treehouse.sh repository
2. Create a CSS file inside the ext folder
3. Use the format below to populate the variables with hex code values. *Tip: Create color variables inside the root block to reuse color styles between custom properties.*

```css
:root {
  --font: 'Font name';

  --color-primary: #hex;

  --color-background: #hex;
  --color-background-sidebar: #hex;

  --color-icon: #hex;
  --color-icon-secondary: #hex;

  --color-nav-label: #hex;

  --color-text: #hex;
  --color-text-placeholder: #hex;
  --color-text-secondary: #hex;

  --color-highlight: #hex;

  --color-node-handle: #hex;
  --color-node-handle-secondary: #hex;

  --color-outline: #hex;
  --color-outline-secondary: #hex;
}
```

### Managing multiple CSS files
If you have multiple CSS files you want to swap between, append ".disabled" to the end of the unused CSS filename(s).

### Variable Reference
<table>
	<tr><th>Variable</th><th>Description</th></tr>
	<tr>
		<td>--font</td>
		<td>Global font definition. Change the font itself but not sizes or styles with this.</td>
	</tr>
	<tr>
		<td>--color-primary</td>
		<td>Background color of primary button</td>
	</tr>
	<tr>
		<td>--color-background</td>
		<td>Background color of main panels, menus, and modals</td>
	</tr>
	<tr>
		<td>--color-background-sidebar</td>
		<td>Background color of sidebar navigation</td>
	</tr>
	<tr>
		<td>--color-icon</td>
		<td>High contrast color used for primary icons. For example: icons in the top navigation</td>
	</tr>
	<tr>
		<td>--color-icon-secondary</td>
		<td>Low-contrast color used for secondary icons</td>
	</tr>
	<tr>
		<td>--color-nav-label</td>
		<td>Used for top and sidebar navigation labels</td>
	</tr>
	<tr>
		<td>--color-text</td>
		<td>Default text color used for body text, navigation, and primary icons</td>
	</tr>
	<tr>
		<td>--color-text-placeholder</td>
		<td>Lower-contrast color used for placeholder text in inputs</td>
	</tr>
	<tr>
		<td>--color-text-secondary</td>
		<td>Lower-contrast color used for secondary text</td>
	</tr>
	<tr>
		<td>--color-highlight</td>
		<td>Lowest-contrast color to subtly highlight selected item in the menu, search, and command palette</td>
	</tr>
	<tr>
		<td>--color-node-handle</td>
		<td>Bullet color for nodes (a.k.a. the node handle)</td>
	</tr>
	<tr>
		<td>--color-node-handle-secondary</td>
		<td>Lower-contrast accent color on node handles. For instance, the outer filled circle on a node indicating collapsed children.</td>
	</tr>
	<tr>
		<td>--color-outline</td>
		<td>High contrast border color on pop-over containers like modals and menus.</td>
	</tr>
	<tr>
		<td>--color-outline-secondary</td>
		<td>Lower contrast border color where less extreme contrast is needed, such as the divider between panels and the navigation.</td>
	</tr>
</table>

### Fonts

To use a non-system font, you may import a font into your CSS file using either the @import method or the @font-face method.