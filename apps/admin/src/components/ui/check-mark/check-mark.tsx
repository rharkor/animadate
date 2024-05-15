import { cn } from "@/lib/utils"

import styles from "./check-mark.module.css"

export default function CheckMarkAnimation({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 214 214"
      className={cn("size-8 text-success", styles["check-circle"], className)}
    >
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <circle
          className={styles["semi-transparent"]}
          fill="currentColor"
          opacity="0.15"
          cx="107"
          cy="107"
          r="72"
        ></circle>
        <circle className={styles["colored"]} fill="currentColor" cx="107" cy="107" r="72" opacity="0.8"></circle>
        <polyline
          stroke="#fff"
          strokeWidth="10"
          points="73.5,107.8 93.7,127.9 142.2,79.4"
          style={{
            strokeDasharray: "50%, 50%",
            strokeDashoffset: "100%",
          }}
        />
      </g>
    </svg>
  )
}
