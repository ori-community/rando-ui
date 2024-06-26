import { renderMarkdown } from '~/assets/lib/markdown'

const didYouKnowList = [
  `You can **make the Item Tracker transparent** to lay it over your game.`,
  `When talking to NPCs, **hold the button to skip dialogues** faster without needing to spam buttons.`,
  `Unlike in the vanilla game, in the randomizer **Sentry and Blaze do target blobs** in Wellspring and Silent Woods.`,
  `Tired of seeing "X Spirit Light"? Turn on **Random Currency Names** in settings`,
  `In the randomizer you can enable **mouse aiming** for Grapple, Burrow and Swimming in settings.`,
  `In the randomizer cleaning the water isn't tied to the Wellspring Escape : it is a randomly placed item. The Wellspring Escape gives you one random item.`,
  `Often clicking outside the game window? You can **lock the cursor to the game window** in settings.`,
  `Press V or hold both triggers to **open the randomizer wheel** while playing.`,
  `You can **wake Baur from behind** using Flap.`,
  `You can **jump over the Kwolok Escape start trigger** to collect the pickup below before completing the fight.`,
  `Most **long cutscenes are skippable** in the randomizer by using the corresponding option in the pause menu.`,
  `Getting lost on the map? You can **enable a minimap** in settings or temporarily in the randomizer wheel.`,
  `In the randomizer, Twillen, Opher and Tokk **appear in all possible locations** every time.`,
  `When talking to Tokk before collecting the First Keystone, you can **return it at any other Tokk location**.`,
  `Ori **does not take damage while talking** to NPCs in the randomizer.`,
  `You can open the **Kwolok Statue keystone door from behind**.`,
  `There are **no Eyestones** in the randomizer. The Kwolok Statue acts like a normal Keystone door.`,
  `Unlike in the vanilla game, the **map in Willow's End is not free**.`,
  `Walk back to the **beginning of a Spirit Trial to show the item** you will get again.`,
  `Unlike in the vanilla game, you **can use Water Dash and Burrow without having Dash**.`,
  `Unlike in the vanilla game, you **can use Deflector without having Bash**.`,
  `Unlike in the vanilla game, you **can use Flap without having Glide**.`,
  `Unlike in the vanilla game, the **Kwolok boss escape** does have **rubberbanding** so he slows down when getting near Ori.`,
  `Unlike in the vanilla game you can **teleport out of water and active Combat Shrines**.`,
  `Most **menu glitches** like Shop Anywhere or using Quick Access are **impossible in the randomizer**.`,
  `When the according option is enabled, you can **stomp into water and portals** with Hammer.`,
  `The **triple jump shockwave** always indicates that you used your last jump when having more than two jumps.`,
  `Hold the **Quick Buy** button in addition to the purchase button to instantly buy items from NPCs. You can remap the button in settings.`,
  `The randomizer **adds support for many non-Xbox controllers**.`,
  `When playing **Multiworld** games with friends, every world can have **different settings and difficulties**.`,
  `Press **Alt+F** to view the **seed settings** while playing. This is customizable in settings.`,
  `Press **Alt+T** to see your **recently picked up items** while playing. This is customizable in settings.`,
  `Press **Alt+P** to see your **seed progress** while playing. This is customizable in settings.`,
  `You can easily **add your tracker to OBS**. Press the three dots at the top of the launcher, click "Create Web Tracker", untick "For Remote Access" and add the resulting URL as a Browser Source.`,
  `When playing with **Launch Fragments**, Launch is **considered as in-logic when you can reach all available Launch Fragments**.`,
  `The **Uncharged Bashgrenades** Bonus+ pickup allows you to **bash off Grenades that you threw midair**.`,
  `The **Wingclip** shard affects the **Willow Stone** boss, but **does not affect Shriek**.`,
  `You can **break small underwater barriers from behind**.`,
  `Hitting something with **Sword resets your aerial abilities**.`,
  `Hitting something with **Hammer does not reset your aerial abilities**, unless when hitting a projectile with Deflector equipped.`,
  `With Deflector equipped, hitting a projectile with **Sword or Hammer resets your aerial abilities**. This includes your own grenades and shurikens.`,
  `**Launching tangential to a slope** gives you **a lot of speed**.`,
  `**Bashing a Grenade** resets its **explosion timer**.`,
  `**Fractured Grenades** do **not break shields** of **Gorlek** enemies.`,
  `The outside **spikes** between the 1st and 2nd floor of Wellspring deal **Fire damage**.`,
  `Ice **spikes in Baur's Reach** do **not deal repeated damage** when standing still.`,
  `You can trigger **Munchers** in Baur's Reach by **throwing a Grenade** into them.`,
  `After the cat and mouse sequence at Feeding Grounds, you can teleport away while Shriek dives onto you **to deactivate the killplane**.`,
  `You can **damage Shriek while in the escape sequence**, unlike other bosses in the game.`,
  `In the **Mora Escape sequence** there is a **spot where Mora doesn't kill you** and will run past you. When you **die after she reaches the upper level**, you will respawn in the 2nd phase.`,
  `When doing the bells puzzle at Burrows entry, **doing the forward solution first let you skip the first 3 notes of the backward solution**.`,
  `Using **Hammer** when swinging off poles **extends your jump**.`,
  `**Keeping your momentum** when **cancelling Grapple with a Jump** only works when having **Double Jump**.`,
  `You can **use your Bonus upgrades in Spirit Trials**.`,
  `When playing with the **Relics** goal mode, the **Relics icon in the Item Tracker** will turn **yellow** when you are in an area that you still miss a relic in.`,
  `**Rapid Sword and Rapid Hammer** shift **Sentry Jump timings**.`,
  `In **online co-op, Keystone Doors and Glades Projects** are **not synced**, allowing your team to check more pickups with less Keystones and Gorlek Ore.`,
  `**Only Grenade and Soup projectiles** can **light furnaces** in Baur's Reach.`,
  `You can **reverse break into Midnight Burrows** from Marsh **only with Shuriken**.`,
]

export const getRandomDidYouKnowHtml = () => renderMarkdown(didYouKnowList[Math.floor(Math.random() * didYouKnowList.length)])
