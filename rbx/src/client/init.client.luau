--!strict
--[[
	Slice 1 client: send WASD, chase cam behind the replicated van.
	A = left (steer +1 → +yaw). Click the 3D view first so Studio gives us keys.
]]

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Vehicle = require(Shared:WaitForChild("Sim"):WaitForChild("Vehicle"))
local remotes = ReplicatedStorage:WaitForChild("Remotes")
local driveRemote = remotes:WaitForChild("DriveInput") :: RemoteEvent

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")
local playerScripts = player:WaitForChild("PlayerScripts")

local root = workspace:WaitForChild("Wereldpost")
if root:GetAttribute("Ready") ~= true then
	root:GetAttributeChangedSignal("Ready"):Wait()
end
local found = root:WaitForChild("Van", 15)
if found == nil or not found:IsA("BasePart") then
	error("[Wereldpost] Van ontbreekt. git pull, rojo serve herstarten, Connect, Play.")
end
local van = found :: BasePart

local CAM_DIST = 28
local CAM_HEIGHT = 12
local LOOK_LIFT = 2.5

local function key(code: Enum.KeyCode): boolean
	return UserInputService:IsKeyDown(code)
end

local function readInput(): Vehicle.DriveInput
	local throttle = 0
	local steer = 0
	if key(Enum.KeyCode.W) or key(Enum.KeyCode.Up) then
		throttle += 1
	end
	if key(Enum.KeyCode.S) or key(Enum.KeyCode.Down) then
		throttle -= 1
	end
	if key(Enum.KeyCode.A) or key(Enum.KeyCode.Left) then
		steer += 1
	end
	if key(Enum.KeyCode.D) or key(Enum.KeyCode.Right) then
		steer -= 1
	end
	return { throttle = throttle, steer = steer }
end

task.defer(function()
	local module = playerScripts:FindFirstChild("PlayerModule")
	if module and module:IsA("ModuleScript") then
		local ok, playerModule = pcall(require, module)
		if ok and playerModule then
			pcall(function()
				playerModule:GetControls():Disable()
			end)
		end
	end
end)

local gui = Instance.new("ScreenGui")
gui.Name = "SliceHud"
gui.ResetOnSpawn = false
gui.IgnoreGuiInset = true
gui.Parent = playerGui

local chip = Instance.new("TextLabel")
chip.Name = "Hint"
chip.AnchorPoint = Vector2.new(0.5, 1)
chip.Position = UDim2.new(0.5, 0, 1, -28)
chip.Size = UDim2.fromOffset(520, 40)
chip.BackgroundColor3 = Color3.fromRGB(28, 36, 48)
chip.BackgroundTransparency = 0.12
chip.TextColor3 = Color3.fromRGB(243, 238, 228)
chip.Font = Enum.Font.SourceSansBold
chip.TextSize = 18
chip.Text = "Klik dit 3D-venster  ·  WASD naar het rode DOEL  ·  A = links"
chip.Parent = gui

local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 8)
corner.Parent = chip

local cam = workspace.CurrentCamera

local function placeCam()
	cam.CameraType = Enum.CameraType.Scriptable
	cam.CameraSubject = van
	local look = van.CFrame.LookVector
	local pos = van.Position
	local desired = pos + Vector3.new(0, CAM_HEIGHT, 0) - look * CAM_DIST
	cam.CFrame = CFrame.new(desired, pos + Vector3.new(0, LOOK_LIFT, 0))
end

placeCam()

local CAMERA_PRIORITY = Enum.RenderPriority.Camera.Value + 10
RunService:BindToRenderStep("WereldpostCam", CAMERA_PRIORITY, function()
	local input = readInput()
	driveRemote:FireServer(input.throttle, input.steer)
	placeCam()
end)

placeCam()