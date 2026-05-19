import { IconCard } from './IconCard';
import { FLAGS_CATEGORIES } from './iconStoryData';
import { Category, Page, Title } from './storyComponents';

export const FlagsTemplate = () => (
  <Page>
    <Title>Флаги - цветные графические символы стран, территорий и международных объединений.</Title>
    {FLAGS_CATEGORIES.map(({ value, label, icons }) => (
      <Category key={value} label={label}>
        {icons.map((icon) => (
          <IconCard key={`${value}${icon.name}`} category={value} icon={icon} />
        ))}
      </Category>
    ))}
  </Page>
);
