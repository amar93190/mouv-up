import { CSSProperties } from "react";

type PointsGaugeProps = {
  value: number;
  max?: number;
  size?: number;
  thickness?: number;
  fillColor?: string;
  trackColor?: string;
  innerColor?: string;
  valueClassName?: string;
  labelClassName?: string;
};

function PointsGauge({
  value,
  max = 200,
  size = 80,
  thickness = 10,
  fillColor = "#1b61f3",
  trackColor = "#e7e7e7",
  innerColor = "#fafafa",
  valueClassName = "text-[20px] font-semibold leading-none tracking-[-0.02em] text-black",
  labelClassName = "text-[14px] leading-none tracking-[-0.02em] text-[#474749]"
}: PointsGaugeProps) {
  const normalized = Math.max(0, Math.min(value, max));
  const progress = (normalized / max) * 100;

  const ringStyle: CSSProperties = {
    width: size,
    height: size,
    background: `conic-gradient(${fillColor} ${progress}%, ${trackColor} ${progress}% 100%)`
  };

  const innerStyle: CSSProperties = {
    top: thickness,
    right: thickness,
    bottom: thickness,
    left: thickness,
    background: innerColor
  };

  return (
    <div className="relative shrink-0 rounded-full" style={ringStyle} aria-label={`Jauge de points: ${value} sur ${max}`}>
      <div className="absolute rounded-full" style={innerStyle} />
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pb-1">
        <span className={valueClassName}>{value}</span>
        <span className={labelClassName}>Pts</span>
      </div>
    </div>
  );
}

export default PointsGauge;
