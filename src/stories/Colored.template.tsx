import { IconCard } from './IconCard';
import { COLORED_CATEGORIES } from './iconStoryData';
import { Category, Page, Title } from './storyComponents';

export const ColoredTemplate = () => (
  <Page>
    <Title>Список иконок с цветовой заливкой для наглядного просмотра альтернативных вариантов стилизации.</Title>
    {COLORED_CATEGORIES.map(({ value, label, icons }) => (
      <Category key={value} label={label} colored>
        {icons.map((icon) => (
          <IconCard key={`${value}${icon.name}`} category={value} icon={icon} />
        ))}
      </Category>
    ))}
  </Page>
);
