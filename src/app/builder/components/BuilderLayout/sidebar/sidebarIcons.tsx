import {
  AlignVerticalSpaceBetween,
  PanelTop,
  PanelBottom,
  SlidersHorizontal,
  Search,
  FileText,
  LayoutPanelLeft,
  PanelRight,
  Type,
  Image,
  Settings,
  Menu,
  Phone,
  User,
  AppWindow,
} from "lucide-react";

export const DesignIcon = (
  props: React.ComponentProps<typeof AlignVerticalSpaceBetween>
) => <AlignVerticalSpaceBetween strokeWidth={2} {...props} />;

export const HeaderIcon = (props: React.ComponentProps<typeof PanelTop>) => (
  <PanelTop strokeWidth={2} {...props} />
);

export const FooterIcon = (props: React.ComponentProps<typeof PanelBottom>) => (
  <PanelBottom strokeWidth={2} {...props} />
);

export const GlobalSettingsIcon = (props: { className?: string }) => (
  <SlidersHorizontal {...props} strokeWidth={2.5} />
);

export const SEOIcon = (props: { className?: string }) => (
  <Search {...props} strokeWidth={2.5} />
);

export const PageSettingIcon = (props: { className?: string }) => (
  <FileText {...props} strokeWidth={2.5} />
);

export const LayoutPanelIcon = (
  props: React.ComponentProps<typeof LayoutPanelLeft>
) => <LayoutPanelLeft strokeWidth={2} {...props} />;

export const PanelRightIcon = (
  props: React.ComponentProps<typeof PanelRight>
) => <PanelRight strokeWidth={2} {...props} />;

export const TypeIcon = (props: React.ComponentProps<typeof Type>) => (
  <Type strokeWidth={2} {...props} />
);

export const ImageIcon = (props: React.ComponentProps<typeof Image>) => (
  <Image strokeWidth={2} {...props} />
);

export const SettingsIcon = (props: React.ComponentProps<typeof Settings>) => (
  <Settings strokeWidth={2} {...props} />
);

export const MenuIcon = (props: React.ComponentProps<typeof Menu>) => (
  <Menu strokeWidth={2} {...props} />
);

export const PhoneIcon = (props: React.ComponentProps<typeof Phone>) => (
  <Phone strokeWidth={2} {...props} />
);

export const UserIcon = (props: React.ComponentProps<typeof User>) => (
  <User strokeWidth={2} {...props} />
);

export const AppWindowIcon = (
  props: React.ComponentProps<typeof AppWindow>
) => <AppWindow strokeWidth={2} {...props} />;
