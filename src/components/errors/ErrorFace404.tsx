import { cn } from "@/lib/utils";

type ErrorFace404Props = {
  className?: string;
};

export function ErrorFace404({ className }: ErrorFace404Props) {
  return (
    <svg
      className={cn("error-face-404 face", className)}
      viewBox="0 0 320 380"
      width="320"
      height="380"
      aria-label="A 404 becomes a face, looks to the sides, and blinks. The 4 slides up, the 0 slides down, and then a mouth appears."
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="25"
      >
        <g className="face__eyes" transform="translate(0, 112.5)">
          <g transform="translate(15, 0)">
            <polyline className="face__eye-lid" points="37,0 0,120 75,120" />
            <polyline
              className="face__pupil"
              points="55,120 55,155"
              strokeDasharray="35 35"
            />
          </g>
          <g transform="translate(230, 0)">
            <polyline className="face__eye-lid" points="37,0 0,120 75,120" />
            <polyline
              className="face__pupil"
              points="55,120 55,155"
              strokeDasharray="35 35"
            />
          </g>
        </g>
        <rect
          className="face__nose"
          rx="4"
          ry="4"
          x="132.5"
          y="112.5"
          width="55"
          height="155"
        />
        <g strokeDasharray="102 102" transform="translate(65, 334)">
          <path
            className="face__mouth-left"
            d="M 0 30 C 0 30 40 0 95 0"
            strokeDashoffset="-102"
          />
          <path
            className="face__mouth-right"
            d="M 95 0 C 150 0 190 30 190 30"
            strokeDashoffset="102"
          />
        </g>
      </g>
    </svg>
  );
}
