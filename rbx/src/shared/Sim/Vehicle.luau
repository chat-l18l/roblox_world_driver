--!strict
--[[
	Slice 1 vehicle: yaw + speed on XZ.
	Basis: yaw 0 faces world -Z; +yaw is CCW about +Y (nose toward -X).
	A / steer +1 → +yaw → nose LEFT under a chase cam. Do not flip this sign.
	Port of src/sim/vehicle.ts, 3D instead of lat/lon.
]]

export type DriveInput = {
	throttle: number,
	steer: number, -- +1 left, -1 right
}

export type State = {
	x: number,
	z: number,
	yaw: number,
	speed: number,
}

local MAX_SPEED = 48
local ACCEL = 36
local TURN_RATE = 2.15
local DRAG = 0.55

local function clamp(n: number, lo: number, hi: number): number
	if n < lo then
		return lo
	end
	if n > hi then
		return hi
	end
	return n
end

local function wrap(a: number): number
	return math.atan2(math.sin(a), math.cos(a))
end

local function create(x: number, z: number): State
	return { x = x, z = z, yaw = 0, speed = 0 }
end

local function step(v: State, input: DriveInput, dt: number): State
	dt = math.min(dt, 0.1)
	local throttle = clamp(input.throttle, -1, 1)
	local steer = clamp(input.steer, -1, 1)

	local speed = v.speed + throttle * ACCEL * dt
	speed -= speed * DRAG * dt
	speed = clamp(speed, -MAX_SPEED * 0.35, MAX_SPEED)

	local cap = MAX_SPEED
	local speedFactor = 0.28 + 0.72 * math.min(1, math.abs(speed) / cap)
	local reverse = if speed >= 0 then 1 else -1
	local yaw = wrap(v.yaw + steer * TURN_RATE * speedFactor * reverse * dt)

	local fx = -math.sin(yaw)
	local fz = -math.cos(yaw)
	return {
		x = v.x + fx * speed * dt,
		z = v.z + fz * speed * dt,
		yaw = yaw,
		speed = speed,
	}
end

local function forward(yaw: number): Vector3
	return Vector3.new(-math.sin(yaw), 0, -math.cos(yaw))
end

local function cframeAt(v: State, y: number): CFrame
	return CFrame.new(v.x, y, v.z) * CFrame.Angles(0, v.yaw, 0)
end

return {
	create = create,
	step = step,
	forward = forward,
	cframeAt = cframeAt,
	MAX_SPEED = MAX_SPEED,
}
