import { Button } from "@/components/ui/button";

type TagItem = {
  clientId: string;
  tagId: number;
  tag: {
    id: number;
    name: string;
    color: string;
  };
};

type Props = {
  tags: TagItem[];
};

export function TagButtons({ tags }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {tags.map((item) => (
        <Button
          key={item.tag.id}
          style={{
            backgroundColor: item.tag.color,
            color: item.tag.color === "#FFFFFF" ? "#000000" : "#FFFFFF",
          }}
          size="xs"
          variant="outline"
          className="rounded-full "
        >
          {item.tag.name}
        </Button>
      ))}
    </div>
  );
}