import { Menu, Segmented, Skeleton } from 'antd';
import { Grid } from 'antd';

import type { Category } from '../../../shared/api/endpoints/categories/categories.types';

interface CategoryTabsProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onChange: (categoryId: number) => void;
  loading: boolean;
}

export function CategoryTabs({
  categories,
  selectedCategoryId,
  onChange,
  loading
}: CategoryTabsProps) {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  if (loading) {
    return (
      <div style={{ padding: 12 }}>
        <Skeleton active paragraph={{ rows: 3 }} title={false} />
      </div>
    );
  }

  if (categories.length === 0) {
    return <div style={{ padding: 12, color: '#6b7280' }}>Категории не найдены</div>;
  }

  const selected = selectedCategoryId ?? categories[0].id;

  if (isMobile) {
    return (
      <div style={{ padding: 12 }}>
        <Segmented
          block
          options={categories.map((category) => ({
            label: category.name,
            value: category.id
          }))}
          value={selected}
          onChange={(value: string | number) => onChange(Number(value))}
        />
      </div>
    );
  }

  return (
    <Menu
      mode="inline"
      selectedKeys={[String(selected)]}
      items={categories.map((category) => ({
        key: String(category.id),
        label: category.name
      }))}
      onClick={({ key }: { key: string }) => onChange(Number(key))}
      style={{ borderInlineEnd: 0 }}
    />
  );
}
