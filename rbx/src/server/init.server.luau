--!strict
--[[
	Slice 1: floor, van, goal. Server owns the van CFrame.
	Next slice: overlap with Goal → arrive event, same reducer as src/sim/session.ts.
]]

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Lighting = game:GetService("Lighting")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Vehicle = require(Shared:WaitForChild("Sim"):WaitForChild("Vehicle"))

workspace.StreamingEnabled = false
Players.CharacterAutoLoads = false

Lighting.Ambient = Color3.fromRGB(110, 108, 104)
Lighting.Brightness = 2.2
Lighting.ClockTime = 14.5
Lighting.GeographicLatitude = 52
Lighting.OutdoorAmbient = Color3.fromRGB(140, 138, 132)

for _, inst in workspace:GetChildren() do
	if inst.Name ~= "Wereldpost" and not inst:IsA("Camera") and not inst:IsA("Terrain") then
		inst:Destroy()
	end
end

local existing = workspace:FindFirstChild("Wereldpost")
if existing then
	existing:Destroy()
end

local remotes = ReplicatedStorage:FindFirstChild("Remotes")
if remotes then
	remotes:Destroy()
end
remotes = Instance.new("Folder")
remotes.Name = "Remotes"
remotes.Parent = ReplicatedStorage
local driveRemote = Instance.new("RemoteEvent")
driveRemote.Name = "DriveInput"
driveRemote.Parent = remotes

local root = Instance.new("Folder")
root.Name = "Wereldpost"

local function block(name: string, size: Vector3, cframe: CFrame, color: Color3): Part
	local p = Instance.new("Part")
	p.Name = name
	p.Size = size
	p.CFrame = cframe
	p.Color = color
	p.Material = Enum.Material.SmoothPlastic
	p.Anchored = true
	p.TopSurface = Enum.SurfaceType.Smooth
	p.BottomSurface = Enum.SurfaceType.Smooth
	p.Parent = root
	return p
end

block("Floor", Vector3.new(240, 2, 240), CFrame.new(0, -1, 0), Color3.fromRGB(217, 208, 190))
local van = block("Van", Vector3.new(6, 3, 10), CFrame.new(0, 1.5, 0), Color3.fromRGB(58, 83, 102))

local goal = block("Goal", Vector3.new(8, 8, 8), CFrame.new(0, 4, -70), Color3.fromRGB(143, 61, 50))
goal.Material = Enum.Material.Neon

local billboard = Instance.new("BillboardGui")
billboard.Name = "Label"
billboard.Size = UDim2.fromOffset(160, 36)
billboard.StudsOffset = Vector3.new(0, 6, 0)
billboard.AlwaysOnTop = true
billboard.Parent = goal

local label = Instance.new("TextLabel")
label.BackgroundTransparency = 1
label.Size = UDim2.fromScale(1, 1)
label.Font = Enum.Font.SourceSansBold
label.TextSize = 22
label.TextColor3 = Color3.fromRGB(243, 238, 228)
label.Text = "DOEL"
label.Parent = billboard

root:SetAttribute("Ready", true)
root.Parent = workspace

local VAN_Y = 1.5
local state = Vehicle.create(0, 0)
local lastInput: Vehicle.DriveInput = { throttle = 0, steer = 0 }

local function clamp1(n: number): number
	if n < -1 then
		return -1
	end
	if n > 1 then
		return 1
	end
	return n
end

driveRemote.OnServerEvent:Connect(function(_player: Player, throttle: unknown, steer: unknown)
	if typeof(throttle) ~= "number" or typeof(steer) ~= "number" then
		return
	end
	lastInput = {
		throttle = clamp1(throttle :: number),
		steer = clamp1(steer :: number),
	}
end)

RunService.Heartbeat:Connect(function(dt: number)
	state = Vehicle.step(state, lastInput, dt)
	van.CFrame = Vehicle.cframeAt(state, VAN_Y)
end)

local function hookPlayer(player: Player)
	player.ReplicationFocus = van
	player.CharacterAdded:Connect(function(character)
		character:Destroy()
	end)
	if player.Character then
		player.Character:Destroy()
	end
end
for _, player in Players:GetPlayers() do
	hookPlayer(player)
end
Players.PlayerAdded:Connect(hookPlayer)

print("[Wereldpost] slice 1 — klik het 3D-venster, WASD, A = links, rij naar DOEL.")
