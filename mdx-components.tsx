import type { MDXComponents } from "mdx/types";
import defaultComponents from "fumadocs-ui/mdx";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import { createGenerator } from "fumadocs-typescript";
import { AutoTypeTable } from "fumadocs-typescript/ui";
import { PreviewContainer } from "@/components/preview/PreviewContainer";
import { Button } from "@/registry/new-york/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/new-york/ui/card";
import { Input } from "@/registry/new-york/ui/input";
import { Textarea } from "@/registry/new-york/ui/textarea";
import { Checkbox } from "@/registry/new-york/ui/checkbox";
import { RadioGroup } from "@/registry/new-york/ui/radio";
import { Select } from "@/registry/new-york/ui/select";
import { Slider } from "@/registry/new-york/ui/slider";
import { Toggle } from "@/registry/new-york/ui/toggle";
import { RoughHighlight } from "@/registry/new-york/primitives/rough-highlight";
import { RoughLine } from "@/registry/new-york/primitives/rough-line";
import { RoughRect } from "@/registry/new-york/primitives/rough-rect";
import { RoughCircle } from "@/registry/new-york/primitives/rough-circle";
import { RoughArrow } from "@/registry/new-york/primitives/rough-arrow";

const generator = createGenerator();

const crumbleComponents = {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  PreviewContainer,
  RadioGroup,
  RoughArrow,
  RoughCircle,
  RoughHighlight,
  RoughLine,
  RoughRect,
  Select,
  Slider,
  Textarea,
  Toggle,
};

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultComponents,
    AutoTypeTable: (props) => (
      <AutoTypeTable {...props} generator={generator} />
    ),
    Tab,
    Tabs,
    pre: ({ ref: _ref, ...props }) => (
      <CodeBlock {...props}>
        <Pre>{props.children}</Pre>
      </CodeBlock>
    ),
    ...crumbleComponents,
    ...components,
  };
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return getMDXComponents(components);
}
