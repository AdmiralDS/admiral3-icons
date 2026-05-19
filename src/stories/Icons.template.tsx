import { IconCard } from './IconCard';
import { ICON_CATEGORIES } from './iconStoryData';
import { Category, Page, Title } from './storyComponents';

export const IconsTemplate = () => (
  <Page>
    <Title>
      Иконки - графические символы, используемые для представления действий, идей или объектов. Позволяют быстро
      передавать смысл отображаемой информации или привлекать к ней дополнительное внимание.
    </Title>
    {ICON_CATEGORIES.map(({ value, label, icons }) => (
      <Category key={value} label={label}>
        {icons.map((icon) => (
          <IconCard key={`${value}${icon.name}`} category={value} icon={icon} />
        ))}
      </Category>
    ))}
  </Page>
);
