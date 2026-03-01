import { Box, Skeleton, Tab, Tabs, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Skeleton variant="rounded" height={42} sx={{ mb: 1 }} />
        <Skeleton variant="rounded" height={42} sx={{ mb: 1 }} />
        <Skeleton variant="rounded" height={42} />
      </Box>
    );
  }

  if (categories.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Категории не найдены
        </Typography>
      </Box>
    );
  }

  const fallbackValue = categories[0]?.id ?? false;

  return (
    <Tabs
      orientation={isMobile ? 'horizontal' : 'vertical'}
      value={selectedCategoryId ?? fallbackValue}
      onChange={(_event, value: number) => onChange(value)}
      variant={isMobile ? 'scrollable' : 'standard'}
      scrollButtons={isMobile ? 'auto' : false}
      sx={{
        borderRight: isMobile ? 0 : 1,
        borderColor: 'divider',
        minHeight: isMobile ? 'auto' : 320
      }}
    >
      {categories.map((category) => (
        <Tab
          key={category.id}
          label={category.name}
          value={category.id}
          sx={{ alignItems: isMobile ? 'center' : 'flex-start' }}
        />
      ))}
    </Tabs>
  );
}
