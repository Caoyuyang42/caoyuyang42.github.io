"""Standalone reproduction of the published seven-indicator Mahalanobis model.

Install: python -m pip install numpy scikit-learn
Run from the source archive: python model_reference/model_reference.py
Or provide inputs explicitly: python model_reference.py --source atlas_delivery_source.json
"""
import argparse
import csv
import json
import math
from pathlib import Path

import numpy as np
from sklearn.cluster import KMeans

KEYS = ['carbon', 'land6', 'land3', 'slope', 'gdp', 'coord', 'solar']
LABELS = ['单位GDP碳排放指数', '碳汇覆盖占比', '土地可用程度',
          '坡度适宜指标', 'GDP经济指数', '耦合协调度', '自然光伏潜力指数']
DIRECTIONS = [1, 1, -1, 1, 1, 1, 1]


def finite(value):
    return isinstance(value, (int, float)) and math.isfinite(value)


def find_source():
    for directory in [Path.cwd(), *Path(__file__).resolve().parents]:
        candidate = directory / 'analysis/atlas_delivery_source.json'
        if candidate.exists():
            return candidate
    raise FileNotFoundError('请通过 --source 指定 analysis/atlas_delivery_source.json')


def reproduce(source, output):
    atlas = json.loads(source.read_text(encoding='utf-8'))
    counties = atlas['counties']
    profiles = {}
    coord_ids, coord_values = [], []
    for c in counties:
        resource, lowcarbon, coupling, coord = None, None, None, None
        if all(finite(c.get(k)) for k in ['radiation', 'slope', 'land3']) and finite(c['v3'].get('gdp')):
            resource = .4*c['radiation'] + .3*c['slope'] + .2*(1-c['land3']) + .1*c['v3']['gdp']
            if all(finite(c.get(k)) for k in ['carbon', 'land6', 'electricity']):
                lowcarbon = .5*(1-c['carbon']) + .3*c['land6'] + .2*(1-c['electricity'])
                coupling = 2*math.sqrt(resource*lowcarbon)/(resource+lowcarbon+1e-10)
                coord = math.sqrt(coupling*(.6*resource+.4*lowcarbon))
                coord_ids.append(c['id'])
                coord_values.append(coord)
        profiles[c['id']] = {'A': resource, 'B': lowcarbon, 'C': coupling, 'D': coord, 'type': None}
    fit = KMeans(n_clusters=5, n_init=50, random_state=42).fit(np.array(coord_values)[:, None])
    centers = fit.cluster_centers_.ravel()
    labels = ['低位型', '偏低型', '中位型', '偏高型', '高位型']
    label_by_cluster = {int(cluster): labels[i] for i, cluster in enumerate(np.argsort(centers))}
    for code, cluster in zip(coord_ids, fit.labels_):
        profiles[code]['type'] = label_by_cluster[int(cluster)]

    def vector(c):
        return [c['v3']['gdp'] if key == 'gdp' else profiles[c['id']]['D'] if key == 'coord'
                else c.get(key) for key in KEYS]
    complete = [c for c in counties if all(finite(value) for value in vector(c))]
    x = np.array([vector(c) for c in complete], dtype=float)
    low, high = x.min(axis=0), x.max(axis=0)
    if np.any(high-low <= 1e-12):
        raise ValueError('七项指标应具有全国差异；请检查输入范围。')
    z = (x-low)/(high-low)
    z[:, 2] = 1-z[:, 2]
    covariance = np.cov(z, rowvar=False)
    regularized = covariance + 1e-6*np.eye(7)
    try:
        inverse, inversion = np.linalg.inv(regularized), 'inverse'
    except np.linalg.LinAlgError:
        inverse, inversion = np.linalg.pinv(regularized), 'pseudoinverse'
    ideal, anti = z.max(axis=0), z.min(axis=0)
    dp = np.sqrt(np.maximum(0, np.einsum('ij,jk,ik->i', z-ideal, inverse, z-ideal)))
    dn = np.sqrt(np.maximum(0, np.einsum('ij,jk,ik->i', z-anti, inverse, z-anti)))
    score = dn/(dp+dn+1e-10)
    thresholds = np.quantile(score, np.linspace(0, 1, 6))
    priority = np.searchsorted(thresholds[1:-1], score, side='left')+1
    descending = np.sort(score)[::-1]
    ranks = np.searchsorted(-descending, -score, side='left')+1
    output.mkdir(parents=True, exist_ok=True)
    metadata = {'method': '七指标正则马氏 TOPSIS', 'features': KEYS, 'featureLabels': LABELS,
                'directions': DIRECTIONS, 'samples': len(complete), 'low': low.tolist(), 'high': high.tolist(),
                'covariance': covariance.tolist(), 'regularizedCovariance': regularized.tolist(),
                'covarianceInverse': inverse.tolist(), 'inverseMethod': inversion, 'regularization': 1e-6,
                'positiveIdeal': ideal.tolist(), 'negativeIdeal': anti.tolist(), 'thresholds': thresholds.tolist(),
                'coordinationCentersAscending': np.sort(centers).tolist(), 'k': 5, 'nInit': 50, 'randomState': 42}
    (output/'模型参数.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding='utf-8')
    column_names = ['县代码', '县名', '省份', '资源系统A', '低碳系统B', '耦合度C', '协调度D', '协调类型',
                    *[label+'（输入）' for label in LABELS], *[label+'（同向归一化）' for label in LABELS],
                    '到正理想点马氏距离', '到负理想点马氏距离', '综合得分', '开发优先级', '全国名次']
    computed_by_id = {c['id']: i for i, c in enumerate(complete)}
    with (output/'评分复算结果.csv').open('w', encoding='utf-8-sig', newline='') as handle:
        writer = csv.writer(handle)
        writer.writerow(column_names)
        for c in counties:
            profile = profiles[c['id']]
            prefix = [c['id'], c['name'], c['province'], profile['A'], profile['B'], profile['C'], profile['D'], profile['type']]
            if c['id'] in computed_by_id:
                i = computed_by_id[c['id']]
                writer.writerow(prefix + x[i].tolist() + z[i].tolist() + [float(dp[i]), float(dn[i]), float(score[i]), int(priority[i]), int(ranks[i])])
            else:
                writer.writerow(prefix + vector(c) + [None]*12)
    stored = np.array([c['v3']['score'] for c in complete], dtype=float)
    max_error = float(np.max(np.abs(stored-score)))
    summary = {'mappedCounties': len(counties), 'scoredCounties': len(complete), 'coordinationCounties': len(coord_ids),
               'priorityCounts': {str(i): int(sum(priority == i)) for i in range(1, 6)},
               'maxAbsoluteDifferenceFromPublishedScore': max_error,
               'missingInputs': [{'id': c['id'], 'name': c['name'], 'indicators': [LABELS[i] for i, v in enumerate(vector(c)) if not finite(v)]}
                                 for c in counties if c['id'] not in computed_by_id],
               'examples': [{'id': c['id'], 'name': c['name'], 'score': float(score[computed_by_id[c['id']]]),
                             'priority': int(priority[computed_by_id[c['id']]]), 'rank': int(ranks[computed_by_id[c['id']]])}
                            for c in complete if c['id'] in ['540424', '540322', '632626']]}
    (output/'复算核对.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return summary


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='复算逐光七指标马氏TOPSIS与耦合协调度')
    parser.add_argument('--source', type=Path, help='冻结输入JSON路径')
    parser.add_argument('--output', type=Path, default=Path(__file__).resolve().parent/'results', help='复算结果目录')
    args = parser.parse_args()
    reproduce(args.source or find_source(), args.output)
