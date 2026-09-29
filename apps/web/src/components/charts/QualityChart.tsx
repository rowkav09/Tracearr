import { useMemo } from 'react';
<<<<<<< HEAD
import { useTranslation } from 'react-i18next';
import Highcharts from 'highcharts';
import { HighchartsReact } from 'highcharts-react-official';
import { PLAYBACK_DECISION_LABEL_KEYS } from '@tracearr/shared';
=======
import Highcharts from 'highcharts';
import { HighchartsReact } from 'highcharts-react-official';
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
import { ChartSkeleton } from '@/components/ui/skeleton';
import { ChartEmpty } from './ChartEmpty';

interface QualityData {
  directPlay: number;
  directStream: number;
  transcode: number;
  total: number;
  directPlayPercent: number;
  directStreamPercent: number;
  transcodePercent: number;
}

interface QualityChartProps {
  data: QualityData | undefined;
  isLoading?: boolean;
  height?: number;
}

const COLORS = {
  directPlay: 'hsl(142, 76%, 36%)', // Green
  directStream: 'hsl(210, 76%, 50%)', // Blue
  transcode: 'hsl(38, 92%, 50%)', // Orange
};

export function QualityChart({ data, isLoading, height = 250 }: QualityChartProps) {
<<<<<<< HEAD
  const { t } = useTranslation();
=======
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
  const options = useMemo<Highcharts.Options>(() => {
    if (!data || data.total === 0) {
      return {};
    }

    return {
      chart: {
        type: 'pie',
        height,
        backgroundColor: 'transparent',
        style: {
          fontFamily: 'inherit',
        },
        reflow: true,
      },
      title: {
        text: undefined,
      },
      credits: {
        enabled: false,
      },
      tooltip: {
        backgroundColor: 'hsl(var(--popover))',
        borderColor: 'hsl(var(--border))',
        style: {
          color: 'hsl(var(--popover-foreground))',
        },
        pointFormat: '<b>{point.y}</b> plays ({point.percentage:.1f}%)',
      },
      plotOptions: {
        pie: {
          innerSize: '60%',
          borderWidth: 0,
          dataLabels: {
            enabled: false,
          },
          showInLegend: true,
        },
      },
      legend: {
        align: 'right',
        verticalAlign: 'middle',
        layout: 'vertical',
        itemStyle: {
          color: 'hsl(var(--foreground))',
        },
        itemHoverStyle: {
          color: 'hsl(var(--primary))',
        },
      },
      series: [
        {
          type: 'pie',
          name: 'Quality',
          data: [
            {
<<<<<<< HEAD
              name: t(PLAYBACK_DECISION_LABEL_KEYS.directplay),
=======
              name: 'Direct Play',
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
              y: data.directPlay,
              color: COLORS.directPlay,
            },
            {
<<<<<<< HEAD
              name: t(PLAYBACK_DECISION_LABEL_KEYS.copy),
=======
              name: 'Direct Stream',
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
              y: data.directStream,
              color: COLORS.directStream,
            },
            {
<<<<<<< HEAD
              name: t(PLAYBACK_DECISION_LABEL_KEYS.transcode),
=======
              name: 'Transcode',
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
              y: data.transcode,
              color: COLORS.transcode,
            },
          ],
        },
      ],
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 400,
            },
            chartOptions: {
              legend: {
                align: 'center',
                verticalAlign: 'bottom',
                layout: 'horizontal',
                itemStyle: {
                  fontSize: '10px',
                },
              },
            },
          },
        ],
      },
    };
<<<<<<< HEAD
  }, [data, height, t]);
=======
  }, [data, height]);
>>>>>>> e10e89cd (Limit image ownership changes to writable data)

  if (isLoading) {
    return <ChartSkeleton height={height} />;
  }

  if (!data || data.total === 0) {
    return <ChartEmpty height={height} message="No quality data available" />;
  }

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      containerProps={{ style: { width: '100%', height: '100%' } }}
    />
  );
}
