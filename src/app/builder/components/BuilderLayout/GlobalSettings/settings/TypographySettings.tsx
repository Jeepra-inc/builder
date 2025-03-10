import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronsUpDown } from "lucide-react";
import { useBuilder } from "@/app/builder/contexts/BuilderContext";
import { Button } from "@/components/ui/button";
import RangeSlider from "./RangeSlider";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColSection } from "./colSection";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type FontType = "heading" | "body";

interface GoogleFont {
  family: string;
  weights: string[];
}

interface FontWeightOption {
  value: string;
  label: string;
}

const FontSettingBlock = ({
  title,
  font,
  setFont,
  sizeScale,
  setSizeScale,
  onFontClick,
}: {
  title: string;
  font: string;
  setFont: (value: string) => void;
  sizeScale: number;
  setSizeScale: (value: number) => void;
  onFontClick: () => void;
}) => (
  <>
    <ColSection title={title} divider={false} className="pb-1">
      <Button
        variant="outline"
        onClick={onFontClick}
        className="flex items-center justify-between w-full"
      >
        <span style={{ fontFamily: font.split(":")[0] }}>
          {font.split(":")[0]}
        </span>
        <ChevronsUpDown size={16} className="text-zinc-400" />
      </Button>
    </ColSection>
    <ColSection title="Font size scale" divider={false}>
      <RangeSlider
        min={50}
        max={150}
        value={sizeScale}
        onValueChange={setSizeScale}
      />
    </ColSection>
  </>
);

const useFontPanel = (
  setHeadingFont: (font: string) => void,
  setBodyFont: (font: string) => void
) => {
  const { headingFont, bodyFont } = useBuilder();
  const [isOpen, setIsOpen] = useState(false);
  const [fontType, setFontType] = useState<FontType>("heading");
  const [tempFont, setTempFont] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWeights, setSelectedWeights] = useState<
    Record<string, string>
  >({});
  const [fontDetails, setFontDetails] = useState<Record<string, GoogleFont>>(
    {}
  );

  const open = (type: FontType) => {
    setFontType(type);
    setIsOpen(true);
    const currentFont = type === "heading" ? headingFont : bodyFont;
    const [family, weight] = currentFont.split(":");
    setTempFont(family);
    setSelectedWeights((prev) => ({
      ...prev,
      [family]: weight || "400",
    }));
  };

  const close = () => {
    setIsOpen(false);
    setSearchTerm("");
  };

  const confirm = () => {
    const weight = selectedWeights[tempFont] || "400";
    const fontWithWeight = `${tempFont}:${weight}`;
    const setter = fontType === "heading" ? setHeadingFont : setBodyFont;
    setter(fontWithWeight);
    close();
  };

  return {
    isOpen,
    fontType,
    tempFont,
    searchTerm,
    selectedWeights,
    setSearchTerm,
    setTempFont,
    open,
    close,
    confirm,
    fontDetails,
    setSelectedWeights,
    setFontDetails,
  };
};

const FontWeightSelector = ({
  font,
  weights,
  selectedWeight,
  onWeightChange,
}: {
  font: string;
  weights: string[];
  selectedWeight: string;
  onWeightChange: (weight: string) => void;
}) => {
  const weightLabels: Record<string, string> = {
    "100": "Thin",
    "200": "Extra Light",
    "300": "Light",
    "400": "Regular",
    "500": "Medium",
    "600": "Semi Bold",
    "700": "Bold",
    "800": "Extra Bold",
    "900": "Black",
  };

  return (
    <Select value={selectedWeight} onValueChange={onWeightChange}>
      <SelectTrigger className="w-[140px] h-8 mt-2">
        <SelectValue placeholder="Select weight" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {weights.map((weight) => (
            <SelectItem key={weight} value={weight}>
              {weightLabels[weight] || `Weight ${weight}`}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export function TypographySettings() {
  const {
    headingColor,
    headingFont,
    setHeadingFont,
    bodyFont,
    setBodyFont,
    headingSizeScale,
    setHeadingSizeScale,
    bodySizeScale,
    setBodySizeScale,
  } = useBuilder();

  const fontPanel = useFontPanel(setHeadingFont, setBodyFont);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [googleFonts, setGoogleFonts] = useState<GoogleFont[]>([]);
  const [visibleFonts, setVisibleFonts] = useState<GoogleFont[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  const systemFonts = ["Arial", "Assistant", "Roboto", "Times New Roman"];
  const batchSize = 10;

  // Allowed Google Fonts list
  const ALLOWED_GOOGLE_FONTS = [
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Source Sans Pro",
    "Slabo 27px",
    "Oswald",
    "Raleway",
    "PT Sans",
    "Merriweather",
    "Noto Sans",
    "Ubuntu",
    "Playfair Display",
    "Fira Sans",
    "Droid Sans",
    "Arimo",
    "Titillium Web",
    "Cabin",
    "Oxygen",
    "Inconsolata",
    "Exo 2",
    "Quicksand",
    "Hind",
    "Work Sans",
    "Heebo",
    "IBM Plex Sans",
    "DM Sans",
    "Nanum Gothic",
    "Karla",
    "Rubik",
    "Poppins",
    "Mukta",
    "Muli",
    "Asap",
    "Assistant",
    "Barlow",
    "Cairo",
    "Catamaran",
    "Chakra Petch",
    "Cuprum",
    "Dosis",
    "Eczar",
    "Jost",
    "Kanit",
    "Libre Franklin",
    "Manrope",
    "Mulish",
    "Nunito",
    "Public Sans",
    "Red Hat Display",
    "Inter",
    "Jost",
    "Urbanist",
    "Space Grotesk",
    "Bebas Neue",
    "Cinzel",
    "Cormorant Garamond",
    "Fjalla One",
    "Spectral",
    "Prata",
    "Domine",
    "Lora",
    "Volkhov",
    "Zilla Slab",
    "Sen",
    "Teko",
    "Anton",
    "Bitter",
    "Caveat",
    "Sarabun",
    "Overpass",
    "Lexend",
    "Alegreya Sans",
    "Amiko",
    "Bai Jamjuree",
    "Chivo",
    "Gothic A1",
    "Josefin Sans",
    "Manjari",
    "Metrophobic",
    "Niramit",
    "Nobile",
    "Padauk",
    "Pontano Sans",
    "Prompt",
    "Quattrocento Sans",
    "Rasa",
    "Rokkitt",
    "Sanchez",
    "Saira",
    "Secular One",
    "Sora",
    "Syne",
    "Tenor Sans",
    "Trirong",
    "Varta",
    "Vesper Libre",
    "Yanone Kaffeesatz",
    "Yatra One",
    "ZCOOL XiaoWei",
  ];

  useEffect(() => {
    fetch(
      "https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyATAoke7VEhGCnTBEwQvBHU1Q0uycKtAm4"
    )
      .then((response) => response.json())
      .then((data) => {
        // Filter fonts to only include allowed ones
        const fonts = data.items
          .filter((item: any) => ALLOWED_GOOGLE_FONTS.includes(item.family))
          .map((item: any) => ({
            family: item.family,
            weights: item.variants
              .filter((v: string) => !v.includes("italic"))
              .map((v: string) => v.replace("regular", "400")),
          }));

        setGoogleFonts(fonts);
        fontPanel.setFontDetails(
          fonts.reduce((acc: Record<string, GoogleFont>, font: GoogleFont) => {
            acc[font.family] = font;
            return acc;
          }, {})
        );

        const initialVisible = fonts.slice(0, batchSize);
        setVisibleFonts(initialVisible);

        initialVisible.forEach(({ family }: { family: string }) =>
          loadFont(family, "400")
        );
      });
  }, []);

  useEffect(() => {
    // Update CSS variables in parent document
    document.documentElement.style.setProperty(
      "--heading-size-scale",
      `${headingSizeScale / 100}`
    );
    document.documentElement.style.setProperty(
      "--body-size-scale",
      `${bodySizeScale / 100}`
    );

    // Update iframe content
    const iframe = document.querySelector("iframe");
    iframe?.contentWindow?.postMessage(
      {
        type: "UPDATE_TYPOGRAPHY",
        settings: {
          headingColor,
          headingFont,
          bodyFont,
          headingSizeScale,
          bodySizeScale,
        },
      },
      "*"
    );
  }, [headingColor, headingFont, bodyFont, headingSizeScale, bodySizeScale]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (
      scrollHeight - (scrollTop + clientHeight) > 50 ||
      loading ||
      visibleFonts.length >= googleFonts.length
    )
      return;

    setLoading(true);
    setTimeout(() => {
      const newFonts = googleFonts.slice(
        visibleFonts.length,
        visibleFonts.length + batchSize
      );
      setVisibleFonts((prev) => {
        newFonts.forEach(({ family }) => loadFont(family, "400"));
        return [...prev, ...newFonts];
      });
      setLoading(false);
    }, 500);
  };

  const loadFont = (font: string, weight: string) => {
    const isGoogleFont = googleFonts.some((f) => f.family === font);
    if (!isGoogleFont) return;

    const fontKey = `${font}:${weight}`;
    if (loadedFonts.has(fontKey)) return;

    const linkId = `font-${font.replace(/ /g, "-")}-${weight}`;
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.href = `https://fonts.googleapis.com/css2?family=${font.replace(
        / /g,
        "+"
      )}:wght@${weight}&display=swap`;
      link.rel = "stylesheet";
      document.head.appendChild(link);

      // Also load in the iframe
      const iframe = document.querySelector("iframe");
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          {
            type: "LOAD_GOOGLE_FONT",
            fontFamily: font,
            fontWeight: weight,
          },
          "*"
        );
      }

      setLoadedFonts((prev) => new Set([...prev, fontKey]));
    }
  };

  const FontItem = ({
    font,
    isGoogle,
  }: {
    font: string;
    isGoogle: boolean;
  }) => {
    const fontData = isGoogle
      ? googleFonts.find((f) => f.family === font)
      : { family: font, weights: ["400"] };

    const selectedWeight = fontPanel.selectedWeights[font] || "400";

    return (
      <>
        <div
          onClick={() => {
            fontPanel.setTempFont(font);
            if (isGoogle) {
              loadFont(font, selectedWeight);
            }
          }}
          className={`p-4 w-full cursor-pointer text-left ${
            fontPanel.tempFont === font ? "bg-gray-200" : ""
          }`}
        >
          <div className="flex items-center justify-between gap-2 w-full">
            <span
              style={{
                fontFamily: font,
                fontWeight: isGoogle ? selectedWeight : "400",
              }}
            >
              {font}
            </span>
            {fontPanel.tempFont === font && <CheckCircle2 />}
          </div>
          {fontPanel.tempFont === font && fontData && (
            <FontWeightSelector
              font={font}
              weights={fontData.weights}
              selectedWeight={selectedWeight}
              onWeightChange={(weight) => {
                fontPanel.setSelectedWeights((prev) => ({
                  ...prev,
                  [font]: weight,
                }));
                if (isGoogle) loadFont(font, weight);
              }}
            />
          )}
        </div>
        <Separator />
      </>
    );
  };

  return (
    <>
      {fontPanel.isOpen && (
        <Dialog
          open={fontPanel.isOpen}
          onOpenChange={(open) => !open && fontPanel.close()}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Select font</DialogTitle>
            </DialogHeader>

            <div className="py-2">
              <Input
                type="text"
                placeholder="Search"
                value={fontPanel.searchTerm}
                onChange={(e) => fontPanel.setSearchTerm(e.target.value)}
              />
            </div>

            <div
              ref={scrollRef}
              className="max-h-[50vh] overflow-y-auto"
              onScroll={handleScroll}
            >
              <div className="p-4">
                <h3 className="text-sm font-bold mb-2">SYSTEM FONTS</h3>
                <p className="text-xs">
                  These fonts load faster and might appear differently on
                  various devices.
                </p>
              </div>
              <Separator />
              {systemFonts
                .filter((f) =>
                  f.toLowerCase().includes(fontPanel.searchTerm.toLowerCase())
                )
                .map((font) => (
                  <FontItem key={font} font={font} isGoogle={false} />
                ))}

              <div className="p-4">
                <h3 className="text-sm font-bold mb-2">GOOGLE FONTS</h3>
                <p className="text-xs">
                  These fonts are downloaded and might cause slower load times.
                </p>
              </div>
              <Separator />
              {fontPanel.searchTerm
                ? googleFonts
                    .filter((f) =>
                      f.family
                        .toLowerCase()
                        .includes(fontPanel.searchTerm.toLowerCase())
                    )
                    .map(({ family }) => {
                      loadFont(family, "400");
                      return (
                        <FontItem key={family} font={family} isGoogle={true} />
                      );
                    })
                : visibleFonts.map(({ family }) => (
                    <FontItem key={family} font={family} isGoogle={true} />
                  ))}

              {loading && !fontPanel.searchTerm && (
                <div className="text-center py-4">Loading more fonts...</div>
              )}
            </div>

            <DialogFooter className="border-t pt-4">
              <Button variant="ghost" size="sm" onClick={fontPanel.close}>
                Cancel
              </Button>
              <Button variant="outline" size="sm" onClick={fontPanel.confirm}>
                Select
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <FontSettingBlock
        title="Headings"
        font={headingFont}
        setFont={setHeadingFont}
        sizeScale={headingSizeScale}
        setSizeScale={setHeadingSizeScale}
        onFontClick={() => fontPanel.open("heading")}
      />
      <Separator />
      <FontSettingBlock
        title="Body"
        font={bodyFont}
        setFont={setBodyFont}
        sizeScale={bodySizeScale}
        setSizeScale={setBodySizeScale}
        onFontClick={() => fontPanel.open("body")}
      />
    </>
  );
}
