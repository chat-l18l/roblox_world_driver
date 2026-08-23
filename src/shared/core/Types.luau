--!strict
--[[
	Alle gedeelde typedefinities. Platte tabellen met vaste velden; geen OOP,
	geen metatables voor domeindata.

	Deze module is PUUR: geen Roblox-API. Daarom eigen Vec2/Vec3 in plaats van
	Vector3 — anders is de laag niet headless te testen onder Lune.

	In M0 staat hier alleen wat de keten nodig heeft. De rest komt in M1 en M2
	mee met de modules die ze gebruiken, zodat een type nooit lang leeg staat.
]]

export type Vec2 = { x: number, y: number }
export type Vec3 = { x: number, y: number, z: number }

export type LatLon = { lat: number, lon: number }

--[[ Wordt door de CI gevuld met de korte commit-hash; lokaal blijft het "dev". ]]
export type BuildInfo = {
	commit: string,
	builtAt: string,
}

return {}
