// The outline follows the visible main river channel in the source illustration.
// Keeping both in source-image coordinates prevents drift when the viewport crops.
const channel = 'M1320 0 C1302 40 1284 91 1260 151 C1243 193 1213 229 1170 251 C1138 269 1110 279 1084 301 C1053 329 1034 355 1014 382 C991 419 964 455 937 483 C907 509 873 526 840 551 C800 579 774 605 755 641 C735 682 725 728 705 770 C683 816 660 851 641 895 L625 941 L777 941 C780 902 786 865 791 833 C802 785 816 746 833 709 C851 670 878 643 906 616 C942 585 971 548 990 511 C1005 480 1010 450 1024 418 C1042 389 1063 363 1090 343 C1121 320 1156 302 1196 287 C1228 276 1260 275 1291 253 C1321 232 1348 190 1369 143 C1382 111 1395 57 1418 0 Z';

export default function RiverScene({ highlighted = true, className = '' }: { highlighted?: boolean; className?: string }) {
  return <svg className={`sq-river-scene ${className}`} viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid slice" role="img" aria-label={highlighted ? 'Satellite-style illustration with the visible river channel outlined' : 'Satellite-style illustration of a braided river'}>
    <image href="/hero-floodplain.png" width="1672" height="941" />
    {highlighted && <path d={channel} fill="#24dfe52b" stroke="#55eef2" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />}
  </svg>
}
